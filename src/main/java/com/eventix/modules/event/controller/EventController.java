package com.eventix.modules.event.controller;

import com.eventix.common.dto.ApiResponse;
import com.eventix.config.security.JwtTokenProvider;
import com.eventix.modules.event.dto.CreateEventRequest;
import com.eventix.modules.event.dto.EventResponse;
import com.eventix.modules.event.service.EventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final JwtTokenProvider jwtTokenProvider;

    // 1. API cho Ban tổ chức tạo sự kiện
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ORGANIZER') or hasAuthority('ROLE_ADMIN')")
    public ApiResponse<EventResponse> createEvent(@Valid @RequestBody CreateEventRequest request,
            HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization").substring(7);
        Long organizerId = jwtTokenProvider.extractClaims(token).get("userId", Long.class);

        return ApiResponse.ok("Tạo sự kiện thành công, đang chờ duyệt", eventService.createEvent(organizerId, request));
    }

    // 2. API Public cho người dùng xem chi tiết sự kiện (Có Cache-Aside)
    @GetMapping("/{id}")
    public ApiResponse<EventResponse> getEventDetail(@PathVariable Long id) {
        return ApiResponse.ok("Lấy thông tin sự kiện thành công", eventService.getEventById(id));
    }

    // 3. API dành riêng cho ADMIN duyệt và nạp kho vé lên Redis
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<EventResponse> publishEvent(@PathVariable Long id) {
        return ApiResponse.ok("Xuất bản sự kiện và Pre-warm kho vé thành công", eventService.publishEvent(id));
    }
}