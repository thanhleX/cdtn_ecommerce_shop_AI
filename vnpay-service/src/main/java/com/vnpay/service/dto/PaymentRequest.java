package com.vnpay.service.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private long amount;
    private String orderInfo;
    private String bankCode;
    private String language;
}
