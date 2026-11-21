package com.eventix.modules.order.controller;

import com.eventix.common.dto.ApiResponse;
import com.eventix.config.security.JwtTokenProvider;
import com.eventix.modules.order.dto.HoldTicketRequest;
import com.eventix.modules.order.dto.OrderResponse;
import com.eventix.modules.order.service.OrderService;
import com.eventix.modules.order.service.WaitingRoomService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final WaitingRoomService waitingRoomService;
    private final JwtTokenProvider jwtTokenProvider;

    // 1. API Khách hàng tham gia phòng chờ ảo
    @PostMapping("/queue/join")
    public ApiResponse<Long> joinQueue(@RequestParam Long eventId, HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        Long position = waitingRoomService.joinQueue(eventId, userId);
        return ApiResponse.ok("Đã vào hàng đợi thành công", position);
    }

    // 2. API Giả lập Worker xả van phòng chờ (Cấp Token cho User để vào mua vé)
    @PostMapping("/queue/pass")
    public ApiResponse<String> getPassToken(@RequestParam Long eventId, @RequestParam Long userId) {
        String token = waitingRoomService.generatePassToken(eventId, userId);
        return ApiResponse.ok("Cấp token thông hành phòng chờ thành công", token);
    }

    // 3. API Core Giữ vé (Hold Ticket) chịu tải cao
    @PostMapping("/hold")
    public ApiResponse<OrderResponse> holdTickets(@Valid @RequestBody HoldTicketRequest request,
            HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        return ApiResponse.ok("Giữ vé thành công. Vui lòng thanh toán trong 10 phút",
                orderService.holdTickets(userId, request));
    }

    // 4. API Hủy đơn hàng
    @DeleteMapping("/{orderId}")
    public ApiResponse<Void> cancelOrder(@PathVariable Long orderId, HttpServletRequest httpRequest) {
        Long userId = extractUserId(httpRequest);
        orderService.cancelOrder(userId, orderId);
        return ApiResponse.ok("Hủy đơn hàng thành công và đã hoàn trả kho", null);
    }

    private Long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtTokenProvider.extractClaims(token).get("userId", Long.class);
    }
}