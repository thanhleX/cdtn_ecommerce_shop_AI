package com.example.shop.application.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueResponse {
    private Long id;
    private Long attributeId;
    private String attributeName;
    private String value;
    private Boolean isPricing;
}
