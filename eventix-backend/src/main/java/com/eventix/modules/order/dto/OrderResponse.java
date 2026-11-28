package com.eventix.modules.order.dto;

import com.eventix.modules.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private Long eventId;
    private Long zoneId;
    private Integer quantity;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private Instant expiresAt;
}