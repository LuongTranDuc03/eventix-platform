package com.eventix.modules.ticket.controller;

import com.eventix.common.dto.ApiResponse;
import com.eventix.config.security.JwtTokenProvider;
import com.eventix.modules.event.entity.Event;
import com.eventix.modules.event.entity.Zone;
import com.eventix.modules.event.repository.EventRepository;
import com.eventix.modules.event.repository.ZoneRepository;
import com.eventix.modules.order.entity.Order;
import com.eventix.modules.order.repository.OrderRepository;
import com.eventix.modules.ticket.dto.TicketResponse;
import com.eventix.modules.ticket.entity.Ticket;
import com.eventix.modules.ticket.repository.TicketRepository;
import com.eventix.modules.ticket.service.GateCheckinService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final GateCheckinService gateCheckinService;
    private final TicketRepository ticketRepository;
    private final OrderRepository orderRepository;
    private final ZoneRepository zoneRepository;
    private final EventRepository eventRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // 1. API cho Nhân viên cổng quét vé (Check-in)
    @PostMapping("/scan")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ApiResponse<String> scanTicket(@RequestParam String ticketCode, HttpServletRequest httpRequest) {
        Long staffId = extractUserId(httpRequest);
        String cleanCode = ticketCode.contains("#") ? ticketCode.substring(0, ticketCode.indexOf("#")) : ticketCode;
        String result = gateCheckinService.scanTicket(cleanCode.trim(), staffId);
        return ApiResponse.ok(result);
    }

    // 2. API cho Khách hàng xem danh sách vé của mình trong ví (Kèm thông tin chi tiết sự kiện & khu vực)
    @GetMapping("/my-tickets")
    public ApiResponse<List<TicketResponse>> getMyTickets(HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        List<Ticket> tickets = ticketRepository.findByUserId(userId);

        if (tickets.isEmpty()) {
            return ApiResponse.ok("Lấy danh sách vé thành công", List.of());
        }

        // Tối ưu hóa truy vấn thông tin bổ sung
        Map<Long, Zone> zoneMap = zoneRepository.findAllById(
                tickets.stream().map(Ticket::getZoneId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(Zone::getId, z -> z));

        Map<Long, Order> orderMap = orderRepository.findAllById(
                tickets.stream().map(Ticket::getOrderId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(Order::getId, o -> o));

        Map<Long, Event> eventMap = eventRepository.findAllById(
                orderMap.values().stream().map(Order::getEventId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(Event::getId, e -> e));

        List<TicketResponse> responses = tickets.stream().map(t -> {
            Order order = orderMap.get(t.getOrderId());
            Zone zone = zoneMap.get(t.getZoneId());
            Event event = (order != null) ? eventMap.get(order.getEventId()) : null;

            return TicketResponse.builder()
                    .id(t.getId())
                    .ticketCode(t.getTicketCode())
                    .orderId(t.getOrderId())
                    .userId(t.getUserId())
                    .zoneId(t.getZoneId())
                    .zoneName(zone != null ? zone.getName() : "Phân khu #" + t.getZoneId())
                    .zoneType(zone != null ? zone.getZoneType().name() : null)
                    .eventId(event != null ? event.getId() : (order != null ? order.getEventId() : null))
                    .eventTitle(event != null ? event.getTitle() : "Sự kiện")
                    .eventVenue(event != null ? event.getVenue() : "")
                    .eventStartDate(event != null ? event.getSalesStartTime() : null)
                    .seatNumber(t.getSeatNumber())
                    .status(t.getStatus())
                    .checkedInAt(t.getCheckedInAt())
                    .createdAt(t.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        return ApiResponse.ok("Lấy danh sách vé thành công", responses);
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.extractClaims(token).get("userId", Long.class);
    }
}
