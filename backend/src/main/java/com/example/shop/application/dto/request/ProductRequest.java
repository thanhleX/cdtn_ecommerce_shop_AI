package com.example.shop.application.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm là bắt buộc")
    private String name;

    private String description;

    @NotNull(message = "ID danh mục là bắt buộc")
    private Long categoryId;

    private Boolean isActive = true;

    @Valid
    private List<VariantRequest> variants;

    // Fields for Simple Product (No variants)
    @Size(max = 100, message = "SKU không được vượt quá 100 ký tự")
    private String sku;

    @PositiveOrZero(message = "Giá sản phẩm không được âm")
    private java.math.BigDecimal price;

    @PositiveOrZero(message = "Số lượng không được âm")
    private Integer quantity;

    @Valid
    private List<ImageRequest> images;
}
