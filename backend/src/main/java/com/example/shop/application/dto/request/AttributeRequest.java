package com.example.shop.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeRequest {
    @NotBlank(message = "Tên thuộc tính không được để trống")
    private String name;
    private Boolean isFilterable;
    private Boolean isPricing;
}
