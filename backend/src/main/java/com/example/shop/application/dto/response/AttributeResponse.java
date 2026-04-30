package com.example.shop.application.dto.response;

import com.example.shop.domain.entity.Attribute;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeResponse {
    private Long id;
    private String name;
    private Boolean isFilterable;
    private Boolean isPricing;
    private List<AttributeValueResponse> values;
}
