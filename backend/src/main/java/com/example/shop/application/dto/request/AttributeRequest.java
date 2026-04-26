package com.example.shop.application.dto.request;

import com.example.shop.domain.entity.Attribute;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeRequest {
    private String name;
    private Boolean isFilterable;
    private Attribute.DisplayType displayType;
    private Boolean isPricing;
}
