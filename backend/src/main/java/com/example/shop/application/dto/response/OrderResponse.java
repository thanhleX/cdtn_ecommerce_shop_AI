package com.example.shop.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private LocalDateTime orderDate;
    private String status;
    private Long paymentMethodId;
    private String paymentMethodName;
    private AddressResponse shippingAddress;
    private String note;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private List<OrderItemResponse> items;
}
