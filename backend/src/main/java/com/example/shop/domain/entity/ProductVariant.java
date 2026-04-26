package com.example.shop.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToMany
    @JoinTable(
        name = "variant_values",
        joinColumns = @JoinColumn(name = "variant_id"),
        inverseJoinColumns = @JoinColumn(name = "attribute_value_id")
    )
    private java.util.List<AttributeValue> attributeValues = new java.util.ArrayList<>();

    @Column(unique = true, length = 100)
    private String sku;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    private Integer quantity;

    @Column(name = "is_active")
    private Boolean isActive;

    public String getAttributesString() {
        if (attributeValues == null || attributeValues.isEmpty()) return "";
        return attributeValues.stream()
                .map(av -> av.getAttribute().getName() + ": " + av.getValue())
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
    }
}
