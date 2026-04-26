package com.example.shop.application.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueRequest {
    private Long attributeId;
    private String value;
}
