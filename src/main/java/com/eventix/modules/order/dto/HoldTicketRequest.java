package com.eventix.modules.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HoldTicketRequest {
    @NotNull(message = "Event ID không được để trống")
    private Long eventId;

    @NotNull(message = "Zone ID không được để trống")
    private Long zoneId;

    @NotNull(message = "Số lượng vé không được để trống")
    @Min(value = 1, message = "Số lượng vé tối thiểu là 1")
    private Integer quantity;

    @NotBlank(message = "Pass Token phòng chờ không được để trống")
    private String passToken;
}