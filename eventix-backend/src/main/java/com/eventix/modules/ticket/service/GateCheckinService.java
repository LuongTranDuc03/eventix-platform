package com.eventix.modules.ticket.service;

import com.eventix.common.exception.AppException;
import com.eventix.common.exception.ErrorCode;
import com.eventix.modules.ticket.entity.Ticket;
import com.eventix.modules.ticket.entity.TicketStatus;
import com.eventix.modules.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class GateCheckinService {

    private final TicketRepository ticketRepository;

    @Transactional
    public String scanTicket(String ticketCode, Long staffId) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Mã vé không tồn tại hoặc không hợp lệ"));

        // Chốt chặn 1: Kiểm tra xem vé đã được sử dụng chưa (Chống quét trùng / Gian
        // lận)
        if (ticket.getStatus() == TicketStatus.CHECKED_IN) {
            log.warn("⚠️ CẢNH BÁO GIAN LẬN: Vé [{}] đã được check-in lúc [{}] bởi nhân viên ID [{}]",
                    ticketCode, ticket.getCheckedInAt(), ticket.getCheckedInBy());
            throw new AppException(ErrorCode.FORBIDDEN,
                    "CẢNH BÁO: Vé này đã được sử dụng trước đó vào lúc " + ticket.getCheckedInAt());
        }

        if (ticket.getStatus() == TicketStatus.REVOKED) {
            throw new AppException(ErrorCode.FORBIDDEN, "Vé này đã bị thu hồi hoặc hủy bỏ");
        }

        // Chốt chặn 2: Đổi trạng thái vé sang CHECKED_IN
        ticket.setStatus(TicketStatus.CHECKED_IN);
        ticket.setCheckedInAt(Instant.now());
        ticket.setCheckedInBy(staffId);
        ticketRepository.save(ticket);

        log.info("🎟️ CHECK-IN THÀNH CÔNG: Vé [{}] đã vào cổng thành công bởi Staff ID [{}]", ticketCode, staffId);
        return "CHECK-IN THÀNH CÔNG: Chào mừng khán giả vào cửa!";
    }
}
