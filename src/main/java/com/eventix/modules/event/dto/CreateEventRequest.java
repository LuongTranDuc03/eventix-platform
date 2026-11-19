package com.eventix.modules.event.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class CreateEventRequest {
    @NotBlank(message = "Tiêu đề sự kiện không được để trống")
    private String title;

    private String description;

    @NotBlank(message = "Địa điểm không được để trống")
    private String venue;

    private String bannerUrl;

    @NotNull(message = "Thời gian mở bán không được để trống")
    @Future(message = "Thời gian mở bán phải ở tương lai")
    private Instant salesStartTime;

    @NotNull(message = "Thời gian kết thúc bán không được để trống")
    @Future(message = "Thời gian kết thúc bán phải ở tương lai")
    private Instant salesEndTime;

    private Integer maxTicketsPerUser = 4;

    @NotEmpty(message = "Sự kiện phải có ít nhất 1 phân khu (Zone)")
    @Valid
    private List<CreateZoneRequest> zones;
}