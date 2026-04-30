package com.example.shop.api.controller;

import com.example.shop.application.dto.common.ApiResponse;
import com.example.shop.application.dto.common.PageResponse;
import com.example.shop.application.dto.request.ReviewRequest;
import com.example.shop.application.dto.response.ReviewResponse;
import com.example.shop.application.service.ReviewService;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.exception.UnauthorizedException;
import com.example.shop.infrastructure.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    private Long getCurrentUserIdOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    private Long getCurrentUserId() {
        Long id = getCurrentUserIdOrNull();
        if (id == null) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }
        return id;
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ReviewResponse> reviews = reviewService.getProductReviews(productId, rating, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá thành công"));
    }

    @GetMapping("/products/{productId}/eligibility")
    public ResponseEntity<ApiResponse<Boolean>> checkEligibility(@PathVariable Long productId) {
        Long userId = getCurrentUserIdOrNull();
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.success(false, "Người dùng chưa đăng nhập"));
        }
        boolean eligible = reviewService.checkEligibility(userId, productId);
        return ResponseEntity.ok(ApiResponse.success(eligible, "Kiểm tra quyền đánh giá thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(request, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response, "Đánh giá sản phẩm thành công"));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.updateReview(reviewId, request, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật đánh giá thành công"));
    }

    @GetMapping("/products/{productId}/stats")
    public ResponseEntity<ApiResponse<com.example.shop.application.dto.response.ReviewStatsResponse>> getProductReviewStats(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviewStats(productId), "Lấy thống kê đánh giá thành công"));
    }

    @PostMapping("/{reviewId}/report")
    public ResponseEntity<ApiResponse<Void>> reportReview(@PathVariable Long reviewId) {
        reviewService.reportReview(reviewId);
        return ResponseEntity.ok(ApiResponse.success(null, "Báo cáo đánh giá thành công"));
    }
}
