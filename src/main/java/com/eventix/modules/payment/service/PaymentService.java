package com.eventix.modules.payment.service;

import com.eventix.common.exception.AppException;
import com.eventix.common.exception.ErrorCode;
import com.eventix.config.rabbitmq.RabbitMQConfig;
import com.eventix.modules.order.entity.Order;
import com.eventix.modules.order.entity.OrderStatus;
import com.eventix.modules.order.repository.OrderRepository;
import com.eventix.modules.payment.dto.TicketIssuanceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RabbitTemplate rabbitTemplate;

    @Transactional
    public void simulatePaymentSuccess(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Đơn hàng không ở trạng thái chờ thanh toán");
        }

        if (Instant.now().isAfter(order.getExpiresAt())) {
            order.setStatus(OrderStatus.EXPIRED);
            orderRepository.save(order);
            throw new AppException(ErrorCode.ORDER_EXPIRED);
        }

        // 1. Cập nhật trạng thái đơn thành PAID
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        // 2. Xóa key giữ chỗ trên Redis (vì đã thanh toán thành công, không sợ timeout
        // nữa)
        String orderHoldKey = "order:hold:" + orderId;
        redisTemplate.delete(orderHoldKey);

        // 3. Đẩy thông điệp sang RabbitMQ để tiến trình ngầm sinh vé bất đồng bộ
        TicketIssuanceEvent event = TicketIssuanceEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .eventId(order.getEventId())
                .zoneId(order.getZoneId())
                .quantity(order.getQuantity())
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.TICKET_EXCHANGE,
                RabbitMQConfig.TICKET_ROUTING_KEY,
                event);

        log.info("💳 THANH TOÁN THÀNH CÔNG CHO ĐƠN HÀNG [{}]: Đã đẩy sự kiện sang RabbitMQ", orderId);
    }
}