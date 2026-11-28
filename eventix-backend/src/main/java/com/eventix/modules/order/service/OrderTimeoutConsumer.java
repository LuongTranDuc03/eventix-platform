package com.eventix.modules.order.service;

import com.eventix.config.rabbitmq.RabbitMQConfig;
import com.eventix.modules.order.dto.OrderTimeoutMessage;
import com.eventix.modules.order.entity.Order;
import com.eventix.modules.order.entity.OrderStatus;
import com.eventix.modules.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderTimeoutConsumer {

    private final OrderRepository orderRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedissonClient redissonClient;

    private static final String STOCK_KEY_PREFIX = "zone:stock:";

    @RabbitListener(queues = RabbitMQConfig.ORDER_RELEASE_QUEUE)
    @Transactional
    public void handleOrderTimeout(OrderTimeoutMessage message) {
        Long orderId = message.getOrderId();
        log.info("⏰ [RabbitMQ Delayed] Kiểm tra hết hạn cho Order [{}]...", orderId);

        String lockKey = "lock:order:" + orderId;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // Xin khóa Redisson để đảm bảo không tranh chấp với tiến trình thanh toán (Payment)
            boolean isLocked = lock.tryLock(5, 10, TimeUnit.SECONDS);
            if (!isLocked) {
                log.warn("⚠️ Không lấy được lock cho đơn hàng [{}], có thể đang được thanh toán", orderId);
                return;
            }

            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                log.warn("⚠️ Không tìm thấy đơn hàng [{}] để xử lý timeout", orderId);
                return;
            }

            Order order = orderOpt.get();

            // Nếu đơn hàng VẪN Ở TRẠNG THÁI PENDING -> Hết 10 phút chưa thanh toán -> Hủy và nhả vé
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.EXPIRED);
                orderRepository.save(order);

                // Hoàn lại vé vào kho Redis nguyên tử
                String stockKey = STOCK_KEY_PREFIX + order.getZoneId();
                redisTemplate.opsForValue().increment(stockKey, order.getQuantity());

                // Xóa tracking key trên Redis nếu còn
                String orderHoldKey = "order:hold:" + orderId;
                redisTemplate.delete(orderHoldKey);

                log.info("♻️ ĐÃ TỰ ĐỘNG THU HỒI VÉ: Đơn hàng [{}] hết hạn. Đã hoàn trả {} vé vào kho zone [{}]",
                        orderId, order.getQuantity(), order.getZoneId());
            } else {
                log.info("ℹ️ Đơn hàng [{}] đã có trạng thái [{}] -> Không cần thu hồi vé", orderId, order.getStatus());
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("❌ Lỗi luồng khi xử lý timeout cho đơn hàng [{}]", orderId, e);
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
