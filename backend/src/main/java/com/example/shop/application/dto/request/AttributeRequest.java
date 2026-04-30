package com.example.shop.application.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeRequest {
    private String name;
    private Boolean isFilterable;
    private Boolean isPricing;
}
