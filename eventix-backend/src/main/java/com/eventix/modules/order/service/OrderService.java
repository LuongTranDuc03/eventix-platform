package com.eventix.modules.order.service;

import com.eventix.common.exception.AppException;
import com.eventix.common.exception.ErrorCode;
import com.eventix.modules.event.entity.Event;
import com.eventix.modules.event.entity.Zone;
import com.eventix.modules.event.repository.EventRepository;
import com.eventix.modules.event.repository.ZoneRepository;
import com.eventix.config.rabbitmq.RabbitMQConfig;
import com.eventix.modules.order.dto.HoldTicketRequest;
import com.eventix.modules.order.dto.OrderResponse;
import com.eventix.modules.order.dto.OrderTimeoutMessage;
import com.eventix.modules.order.entity.Order;
import com.eventix.modules.order.entity.OrderStatus;
import com.eventix.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final EventRepository eventRepository;
    private final ZoneRepository zoneRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedissonClient redissonClient;
    private final WaitingRoomService waitingRoomService;
    private final RabbitTemplate rabbitTemplate;

    private static final String STOCK_KEY_PREFIX = "zone:stock:";

    // 1. Nghiệp vụ Giữ vé (Hold Ticket) chịu tải cao
    @Transactional
    public OrderResponse holdTickets(Long userId, HoldTicketRequest request) {
        // Kiểm tra Token phòng chờ
        boolean isValidToken = waitingRoomService.validatePassToken(request.getEventId(), userId,
                request.getPassToken());
        if (!isValidToken) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn chưa qua phòng chờ hoặc token đã hết hạn");
        }

        // Chốt chặn 1: Kiểm tra xem User có đang giữ đơn nào chưa thanh toán không
        if (orderRepository.existsByUserIdAndStatus(userId, OrderStatus.PENDING)) {
            throw new AppException(ErrorCode.USER_HAS_PENDING_ORDER);
        }

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy sự kiện"));

        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phân khu vé"));

        if (!zone.getEvent().getId().equals(event.getId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Phân khu không thuộc sự kiện này");
        }

        // Chốt chặn 2: Giới hạn số lượng vé tối đa được mua mỗi user
        int userTotalBoughtOrHeld = orderRepository.sumQuantityByUserIdAndEventId(userId, event.getId());
        if (userTotalBoughtOrHeld + request.getQuantity() > event.getMaxTicketsPerUser()) {
            throw new AppException(ErrorCode.TICKET_LIMIT_EXCEEDED);
        }

        // CHỐT CHẶN 3: SỬ DỤNG REDIS LUA SCRIPT ĐỂ TRỪ KHO NGUYÊN TỬ (ATOMIC STOCK
        // DECREMENT)
        String stockKey = STOCK_KEY_PREFIX + zone.getId();
        DefaultRedisScript<Long> luaScript = new DefaultRedisScript<>();
        luaScript.setLocation(new ClassPathResource("scripts/decrement_stock.lua"));
        luaScript.setResultType(Long.class);

        Long stockResult = redisTemplate.execute(luaScript, Collections.singletonList(stockKey), request.getQuantity());

        if (stockResult == null || stockResult == -1) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi hệ thống kho vé");
        }
        if (stockResult == -2) {
            throw new AppException(ErrorCode.ZONE_SOLD_OUT);
        }

        // Nếu trừ kho Redis thành công, tiến hành tạo Order trong PostgreSQL
        String orderCode = "ORD-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        BigDecimal totalAmount = zone.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        Instant expiresAt = Instant.now().plusSeconds(600); // Giữ vé trong 10 phút

        Order order = Order.builder()
                .orderCode(orderCode)
                .userId(userId)
                .eventId(event.getId())
                .zoneId(zone.getId())
                .quantity(request.getQuantity())
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .expiresAt(expiresAt)
                .version(0)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Lưu Redis Key để tracking thời hạn 10 phút hết hạn
        String orderHoldKey = "order:hold:" + savedOrder.getId();
        redisTemplate.opsForValue().set(orderHoldKey, savedOrder.getId(), 10, TimeUnit.MINUTES);

        // BẮN TIN NHẮN DELAYED VÀO RABBITMQ (10 PHÚT = 600,000 ms)
        OrderTimeoutMessage timeoutMessage = OrderTimeoutMessage.builder()
                .orderId(savedOrder.getId())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_DELAY_EXCHANGE,
                RabbitMQConfig.ORDER_RELEASE_ROUTING_KEY,
                timeoutMessage,
                message -> {
                    // Header x-delay dùng cho rabbitmq-delayed-message-exchange plugin (tính theo miligiây)
                    message.getMessageProperties().setHeader("x-delay", 10 * 60 * 1000);
                    return message;
                });

        log.info("🔥 GIỮ VÉ THÀNH CÔNG: User [{}] giữ {} vé phân khu [{}]. Đã lên lịch tự động hủy sau 10 phút.",
                userId, request.getQuantity(), zone.getName());

        return mapToResponse(savedOrder);
    }

    // 2. Nghiệp vụ Hủy đơn hàng (User chủ động hủy hoặc hết 10 phút)
    @Transactional
    public void cancelOrder(Long userId, Long orderId) {
        String lockKey = "lock:order:" + orderId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // Xin khóa phân tán Redisson để chống tranh chấp Đa thiết bị (Mua vs Hủy cùng
            // lúc)
            boolean isLocked = lock.tryLock(3, 10, TimeUnit.SECONDS);
            if (!isLocked) {
                throw new AppException(ErrorCode.OPTIMISTIC_LOCK_CONFLICT);
            }

            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn hàng"));

            if (!order.getUserId().equals(userId)) {
                throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền thao tác trên đơn hàng này");
            }

            if (order.getStatus() != OrderStatus.PENDING) {
                throw new AppException(ErrorCode.ORDER_ALREADY_CANCELLED);
            }

            // Cập nhật trạng thái đơn thành CANCELLED
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            // Hoàn lại vé vào kho Redis
            String stockKey = STOCK_KEY_PREFIX + order.getZoneId();
            redisTemplate.opsForValue().increment(stockKey, order.getQuantity());

            log.info("🔄 ĐÃ HỦY ĐƠN HÀNG [{}]: Hoàn trả {} vé vào kho Redis", orderId, order.getQuantity());

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi luồng xử lý khóa đơn hàng");
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    // 3. Lấy thông tin chi tiết đơn hàng cho khách thanh toán
    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (!order.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền xem thông tin đơn hàng này");
        }

        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .eventId(order.getEventId())
                .zoneId(order.getZoneId())
                .quantity(order.getQuantity())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .expiresAt(order.getExpiresAt())
                .build();
    }
}