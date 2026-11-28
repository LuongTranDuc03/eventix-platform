package com.eventix.modules.event.dto;

import com.eventix.modules.event.entity.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private Long id;
    private Long organizerId;
    private String title;
    private String description;
    private String venue;
    private String bannerUrl;
    private EventStatus status;
    private Instant salesStartTime;
    private Instant salesEndTime;
    private Integer maxTicketsPerUser;
    private List<ZoneResponse> zones;
}