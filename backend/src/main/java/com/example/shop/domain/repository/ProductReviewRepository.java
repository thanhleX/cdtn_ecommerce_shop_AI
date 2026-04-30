package com.example.shop.domain.repository;

import com.example.shop.domain.entity.ProductReview;
import com.example.shop.domain.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findByProductIdAndStatus(Long productId, ReviewStatus status, Pageable pageable);
    
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    Page<ProductReview> findByStatus(ReviewStatus status, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT new com.example.shop.application.dto.response.ReviewStatsResponse(COUNT(r), COALESCE(AVG(r.rating), 0.0), " +
           "COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1L ELSE 0L END), 0L), " +
           "COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1L ELSE 0L END), 0L), " +
           "COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1L ELSE 0L END), 0L), " +
           "COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1L ELSE 0L END), 0L), " +
           "COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1L ELSE 0L END), 0L)) " +
           "FROM ProductReview r WHERE r.product.id = :productId AND r.status = :status")
    com.example.shop.application.dto.response.ReviewStatsResponse getReviewStats(@org.springframework.data.repository.query.Param("productId") Long productId, @org.springframework.data.repository.query.Param("status") ReviewStatus status);
}
