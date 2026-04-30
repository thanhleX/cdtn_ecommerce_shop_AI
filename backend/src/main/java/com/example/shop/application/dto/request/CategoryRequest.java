package com.example.shop.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private Long parentId;

    private Boolean isActive = true;

    private String imageUrl;
}
