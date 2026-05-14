package com.example.shop.domain.entity;

import com.example.shop.domain.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "product_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReview extends BaseAuditEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.ACTIVE;
}
