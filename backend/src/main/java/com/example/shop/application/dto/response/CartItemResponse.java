package com.example.shop.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long productVariantId;
    private String productName;
    private String productSlug;
    private String variantAttributes;
    private String sku;
    private BigDecimal price;
    private String imageUrl;
    private Integer quantity;
    private Boolean isActive;
}
