package com.example.shop.application.service;

import com.example.shop.application.dto.common.PageResponse;
import com.example.shop.application.dto.request.ReviewRequest;
import com.example.shop.application.dto.response.ReviewResponse;
import com.example.shop.domain.entity.Product;
import com.example.shop.domain.entity.ProductReview;
import com.example.shop.domain.entity.User;
import com.example.shop.domain.enums.OrderStatus;
import com.example.shop.domain.enums.ReviewStatus;
import com.example.shop.domain.repository.OrderItemRepository;
import com.example.shop.domain.repository.ProductRepository;
import com.example.shop.domain.repository.ProductReviewRepository;
import com.example.shop.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ProductReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public boolean checkEligibility(Long userId, Long productId) {
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            return false;
        }
        return orderItemRepository.existsByUserIdAndProductIdAndOrderStatusIn(
                userId, productId, List.of(OrderStatus.COMPLETED));
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest request, Long userId) {
        if (!checkEligibility(userId, request.getProductId())) {
            throw new AppException(ErrorCode.USER_NOT_ELIGIBLE_TO_REVIEW);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductReview review = ProductReview.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.ACTIVE)
                .build();

        review = reviewRepository.save(review);
        updateProductStats(product.getId());
        return mapToResponse(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getProductReviews(Long productId, Integer rating, Pageable pageable) {
        Page<ProductReview> page;
        if (rating != null && rating > 0) {
            page = reviewRepository.findByProductIdAndStatusAndRating(productId, ReviewStatus.ACTIVE, rating, pageable);
        } else {
            page = reviewRepository.findByProductIdAndStatus(productId, ReviewStatus.ACTIVE, pageable);
        }
        return PageResponse.of(page.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public com.example.shop.application.dto.response.ReviewStatsResponse getProductReviewStats(Long productId) {
        return reviewRepository.getReviewStats(productId, ReviewStatus.ACTIVE);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, Long userId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.NOT_YOUR_REVIEW);
        }
        
        if (review.getCreatedAt().plusDays(1).isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.REVIEW_EDIT_TIMEOUT);
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);
        updateProductStats(review.getProduct().getId());
        return mapToResponse(review);
    }

    @Transactional
    public void reportReview(Long reviewId, Long reporterUserId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (review.getUser().getId().equals(reporterUserId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        review.setStatus(ReviewStatus.REPORTED);
        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getAllReviews(ReviewStatus status, Pageable pageable) {
        Page<ProductReview> page;
        if (status != null) {
            page = reviewRepository.findByStatus(status, pageable);
        } else {
            page = reviewRepository.findAll(pageable);
        }
        return PageResponse.of(page.map(this::mapToResponse));
    }

    @Transactional
    public void updateReviewStatus(Long reviewId, ReviewStatus status) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setStatus(status);
        reviewRepository.save(review);
        updateProductStats(review.getProduct().getId());
    }

    private void updateProductStats(Long productId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            com.example.shop.application.dto.response.ReviewStatsResponse stats = reviewRepository.getReviewStats(productId, ReviewStatus.ACTIVE);
            product.setAverageRating(stats.getAverageRating());
            product.setReviewCount(stats.getTotalReviews().intValue());
            productRepository.save(product);
        }
    }

    private ReviewResponse mapToResponse(ProductReview review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .fullName(review.getUser().getFullName())
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus().name())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
