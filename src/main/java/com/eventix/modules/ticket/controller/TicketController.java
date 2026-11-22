package com.eventix.modules.ticket.controller;

import com.eventix.common.dto.ApiResponse;
import com.eventix.config.security.JwtTokenProvider;
import com.eventix.modules.ticket.entity.Ticket;
import com.eventix.modules.ticket.repository.TicketRepository;
import com.eventix.modules.ticket.service.GateCheckinService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final GateCheckinService gateCheckinService;
    private final TicketRepository ticketRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // 1. API cho Nhân viên cổng quét vé (Check-in)
    @PostMapping("/scan")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ApiResponse<String> scanTicket(@RequestParam String ticketCode, HttpServletRequest httpRequest) {
        Long staffId = extractUserId(httpRequest);
        String result = gateCheckinService.scanTicket(ticketCode, staffId);
        return ApiResponse.ok(result);
    }

    // 2. API cho Khách hàng xem danh sách vé của mình trong ví
    @GetMapping("/my-tickets")
    public ApiResponse<List<Ticket>> getMyTickets(HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        return ApiResponse.ok("Lấy danh sách vé thành công", tickets);
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.extractClaims(token).get("userId", Long.class);
    }
}