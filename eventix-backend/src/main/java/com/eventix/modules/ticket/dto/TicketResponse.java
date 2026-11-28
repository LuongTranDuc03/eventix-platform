package com.eventix.modules.ticket.dto;

import com.eventix.modules.ticket.entity.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketCode;
    private Long orderId;
    private Long userId;
    private Long zoneId;
    private String zoneName;
    private String zoneType;
    private Long eventId;
    private String eventTitle;
    private String eventVenue;
    private Instant eventStartDate;
    private String seatNumber;
    private TicketStatus status;
    private Instant checkedInAt;
    private Instant createdAt;
}

