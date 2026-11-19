package com.eventix.modules.event.dto;

import com.eventix.modules.event.entity.ZoneType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateZoneRequest {
    @NotBlank(message = "Tên phân khu không được để trống")
    private String name;

    @NotNull(message = "Loại phân khu không được để trống (STANDING/SEATED)")
    private ZoneType zoneType;

    @NotNull(message = "Giá vé không được để trống")
    @Min(value = 0, message = "Giá vé phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "Số lượng vé không được để trống")
    @Min(value = 1, message = "Số lượng vé tối thiểu là 1")
    private Integer totalCapacity;
}