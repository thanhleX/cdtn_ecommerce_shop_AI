package com.example.shop.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class VariantResponse {
    private Long id;
    private String sku;
    private java.util.List<AttributeValueResponse> attributeValues;
    private java.math.BigDecimal price;
    private Integer quantity;
    private Boolean isActive;
}
