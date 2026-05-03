package com.example.shop.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttributeValueRequest {
    @NotNull(message = "ID thuộc tính là bắt buộc")
    private Long attributeId;
    
    @NotBlank(message = "Giá trị thuộc tính không được để trống")
    private String value;
}
