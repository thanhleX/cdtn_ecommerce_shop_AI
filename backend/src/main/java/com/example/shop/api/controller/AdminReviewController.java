package com.example.shop.api.controller;

import com.example.shop.application.dto.common.ApiResponse;
import com.example.shop.application.dto.common.PageResponse;
import com.example.shop.application.dto.response.ReviewResponse;
import com.example.shop.application.service.ReviewService;
import com.example.shop.domain.enums.ReviewStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @PreAuthorize("hasAuthority('product:update') or hasAuthority('product:create')")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAllReviews(
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ReviewResponse> reviews = reviewService.getAllReviews(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(reviews, "Lấy danh sách đánh giá thành công"));
    }

    @PutMapping("/{reviewId}/status")
    @PreAuthorize("hasAuthority('product:update')")
    public ResponseEntity<ApiResponse<Void>> updateReviewStatus(
            @PathVariable Long reviewId,
            @RequestParam ReviewStatus status) {
        reviewService.updateReviewStatus(reviewId, status);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái đánh giá thành công"));
    }
}
