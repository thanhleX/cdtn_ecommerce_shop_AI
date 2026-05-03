package com.example.shop.domain.repository;

import com.example.shop.domain.entity.ProductReview;
import com.example.shop.domain.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.shop.application.dto.response.ReviewStatsResponse;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findByProductIdAndStatus(Long productId, ReviewStatus status, Pageable pageable);
    Page<ProductReview> findByProductIdAndStatusAndRating(Long productId, ReviewStatus status, Integer rating, Pageable pageable);

    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    Page<ProductReview> findByStatus(ReviewStatus status, Pageable pageable);

    @Query("SELECT new com.example.shop.application.dto.response.ReviewStatsResponse(" +
           "COUNT(r), " +
           "CAST(COALESCE(AVG(r.rating), 5.0) AS double), " +
           "CAST(COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1L ELSE 0L END), 0L) AS long), " +
           "CAST(COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1L ELSE 0L END), 0L) AS long), " +
           "CAST(COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1L ELSE 0L END), 0L) AS long), " +
           "CAST(COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1L ELSE 0L END), 0L) AS long), " +
           "CAST(COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1L ELSE 0L END), 0L) AS long)) " +
           "FROM ProductReview r WHERE r.product.id = :productId AND r.status = :status")
    ReviewStatsResponse getReviewStats(@Param("productId") Long productId, @Param("status") ReviewStatus status);
}
