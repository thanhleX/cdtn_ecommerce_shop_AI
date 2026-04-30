package com.example.shop.application.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private Long productId;
    private Integer rating;
    private String comment;
    private String status;
    private LocalDateTime createdAt;
}
