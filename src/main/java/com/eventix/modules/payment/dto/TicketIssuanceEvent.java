package com.eventix.modules.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketIssuanceEvent implements Serializable {
    private Long orderId;
    private Long userId;
    private Long eventId;
    private Long zoneId;
    private Integer quantity;
}