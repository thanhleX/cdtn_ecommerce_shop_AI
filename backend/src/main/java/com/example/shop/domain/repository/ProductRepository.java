package com.example.shop.domain.repository;

import com.example.shop.domain.entity.Product;
import com.example.shop.domain.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
        Page<Product> findByCategory(Category category, Pageable pageable);

        @Query(value = "SELECT DISTINCT p.* FROM products p " +
                        "WHERE (:keyword IS NULL OR :keyword = '' " +
                        "   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                        "   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                        "AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds)) " +
                        "AND (:isActive IS NULL OR p.is_active = :isActive) " +
                        "AND (:minPrice IS NULL OR EXISTS ( " +
                        "    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.price >= :minPrice " +
                        ")) " +
                        "AND (:maxPrice IS NULL OR EXISTS ( " +
                        "    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.price <= :maxPrice " +
                        ")) " +
                        "AND (:hasAttributeValueIds = false OR EXISTS ( " +
                        "    SELECT 1 FROM product_variants v " +
                        "    JOIN variant_values vv ON v.id = vv.variant_id " +
                        "    WHERE v.product_id = p.id " +
                        "    AND vv.attribute_value_id IN (:attributeValueIds) " +
                        "    GROUP BY v.id " +
                        "    HAVING COUNT(DISTINCT vv.attribute_value_id) = :attrCount " +
                        "))",

                        countQuery = "SELECT COUNT(DISTINCT p.id) FROM products p " +
                                        "WHERE (:keyword IS NULL OR :keyword = '' " +
                                        "   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                                        "   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                                        "AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds)) " +
                                        "AND (:isActive IS NULL OR p.is_active = :isActive) " +
                                        "AND (:minPrice IS NULL OR EXISTS ( " +
                                        "    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.price >= :minPrice " +
                                        ")) " +
                                        "AND (:maxPrice IS NULL OR EXISTS ( " +
                                        "    SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.price <= :maxPrice " +
                                        ")) " +
                                        "AND (:hasAttributeValueIds = false OR EXISTS ( " +
                                        "    SELECT 1 FROM product_variants v " +
                                        "    JOIN variant_values vv ON v.id = vv.variant_id " +
                                        "    WHERE v.product_id = p.id " +
                                        "    AND vv.attribute_value_id IN (:attributeValueIds) " +
                                        "    GROUP BY v.id " +
                                        "    HAVING COUNT(DISTINCT vv.attribute_value_id) = :attrCount " +
                                        "))",

                        nativeQuery = true)
        Page<Product> findByFilters(
                        @Param("keyword") String keyword,
                        @Param("hasCategoryIds") boolean hasCategoryIds,
                        @Param("categoryIds") List<Long> categoryIds,
                        @Param("minPrice") BigDecimal minPrice,
                        @Param("maxPrice") BigDecimal maxPrice,
                        @Param("isActive") Boolean isActive,
                        @Param("hasAttributeValueIds") boolean hasAttributeValueIds,
                        @Param("attributeValueIds") List<Long> attributeValueIds,
                        @Param("attrCount") Long attrCount,
                        Pageable pageable);
                        
        @Query(value = "SELECT MIN(v.price) FROM product_variants v " +
                   "JOIN products p ON v.product_id = p.id " +
                   "WHERE (:keyword IS NULL OR :keyword = '' " +
                   "   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                   "AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds)) " +
                   "AND (:isActive IS NULL OR p.is_active = :isActive) " +
                   "AND (:hasAttributeValueIds = false OR EXISTS ( " +
                   "    SELECT 1 FROM variant_values vv " +
                   "    WHERE vv.variant_id = v.id " +
                   "    AND vv.attribute_value_id IN (:attributeValueIds) " +
                   "    GROUP BY vv.variant_id " +
                   "    HAVING COUNT(DISTINCT vv.attribute_value_id) = :attrCount " +
                   "))", nativeQuery = true)
        java.math.BigDecimal findMinPriceByFilters(
                        @Param("keyword") String keyword,
                        @Param("hasCategoryIds") boolean hasCategoryIds,
                        @Param("categoryIds") List<Long> categoryIds,
                        @Param("isActive") Boolean isActive,
                        @Param("hasAttributeValueIds") boolean hasAttributeValueIds,
                        @Param("attributeValueIds") List<Long> attributeValueIds,
                        @Param("attrCount") Long attrCount);

        @Query(value = "SELECT MAX(v.price) FROM product_variants v " +
                   "JOIN products p ON v.product_id = p.id " +
                   "WHERE (:keyword IS NULL OR :keyword = '' " +
                   "   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
                   "   OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                   "AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds)) " +
                   "AND (:isActive IS NULL OR p.is_active = :isActive) " +
                   "AND (:hasAttributeValueIds = false OR EXISTS ( " +
                   "    SELECT 1 FROM variant_values vv " +
                   "    WHERE vv.variant_id = v.id " +
                   "    AND vv.attribute_value_id IN (:attributeValueIds) " +
                   "    GROUP BY vv.variant_id " +
                   "    HAVING COUNT(DISTINCT vv.attribute_value_id) = :attrCount " +
                   "))", nativeQuery = true)
        java.math.BigDecimal findMaxPriceByFilters(
                        @Param("keyword") String keyword,
                        @Param("hasCategoryIds") boolean hasCategoryIds,
                        @Param("categoryIds") List<Long> categoryIds,
                        @Param("isActive") Boolean isActive,
                        @Param("hasAttributeValueIds") boolean hasAttributeValueIds,
                        @Param("attributeValueIds") List<Long> attributeValueIds,
                        @Param("attrCount") Long attrCount);

        boolean existsBySlug(String slug);

        Optional<Product> findBySlug(String slug);

        @Query(value = "SELECT * FROM products WHERE is_active = true ORDER BY RAND() LIMIT 4", nativeQuery = true)
        List<Product> findFeaturedProducts();
}
