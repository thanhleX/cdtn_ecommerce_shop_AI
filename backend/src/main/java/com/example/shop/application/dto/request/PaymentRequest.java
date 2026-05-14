package com.example.shop.application.dto.request;

import lombok.Data;

@Data
public class PaymentRequest {
    private long amount;
    private String orderInfo;
    private String bankCode;
    private String language;
    private String returnUrl;
}
