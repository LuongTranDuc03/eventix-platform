package com.eventix.modules.ticket.service;

import com.eventix.config.rabbitmq.RabbitMQConfig;
import com.eventix.modules.payment.dto.TicketIssuanceEvent;
import com.eventix.modules.ticket.entity.Ticket;
import com.eventix.modules.ticket.entity.TicketStatus;
import com.eventix.modules.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketConsumer {

    private final TicketRepository ticketRepository;

    @RabbitListener(queues = RabbitMQConfig.TICKET_ISSUANCE_QUEUE)
    @Transactional
    public void handleTicketIssuance(TicketIssuanceEvent event) {
        log.info("📥 [RabbitMQ Consumer] Nhận yêu cầu xuất {} vé cho Order [{}]", event.getQuantity(),
                event.getOrderId());

        for (int i = 1; i <= event.getQuantity(); i++) {
            String ticketCode = "TKT-" + event.getEventId() + "-"
                    + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            Ticket ticket = Ticket.builder()
                    .ticketCode(ticketCode)
                    .orderId(event.getOrderId())
                    .userId(event.getUserId())
                    .zoneId(event.getZoneId())
                    .status(TicketStatus.ISSUED)
                    .seatNumber(null) // Cập nhật số ghế nếu là zone SEATED
                    .build();

            ticketRepository.save(ticket);
        }

        log.info("✅ XUẤT VÉ THÀNH CÔNG: Đã tạo xong toàn bộ vé cho đơn hàng [{}]", event.getOrderId());
    }
}