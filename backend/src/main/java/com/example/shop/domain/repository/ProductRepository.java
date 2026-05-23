package com.example.shop.domain.repository;

import com.example.shop.domain.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

        @Query(value = """
        SELECT p.*, MIN(v.price) AS price
        FROM products p

        LEFT JOIN product_variants v
            ON v.product_id = p.id

        LEFT JOIN product_variants v2
            ON v2.product_id = p.id

        LEFT JOIN variant_values vv
            ON vv.variant_id = v2.id

        WHERE
            (:keyword IS NULL OR :keyword = ''
             OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR EXISTS (SELECT 1 FROM product_variants v_sku WHERE v_sku.product_id = p.id AND LOWER(v_sku.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))))
        AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds))
        AND (:isActive IS NULL OR p.is_active = :isActive)
        AND (:minPrice IS NULL OR EXISTS (
            SELECT 1
            FROM product_variants v3
            WHERE v3.product_id = p.id
              AND v3.price >= :minPrice
        ))
        AND (:maxPrice IS NULL OR EXISTS (
            SELECT 1
            FROM product_variants v4
            WHERE v4.product_id = p.id
              AND v4.price <= :maxPrice
        ))
        GROUP BY p.id
        HAVING
            (:hasAttributeValueIds = false OR
                COUNT(DISTINCT
                    CASE
                        WHEN vv.attribute_value_id IN (:attributeValueIds)
                        THEN vv.attribute_value_id
                    END
                ) = :attrCount
            )
        """,
                countQuery = """
        SELECT COUNT(*) FROM (
            SELECT p.id
            FROM products p
            LEFT JOIN product_variants v2
                ON v2.product_id = p.id
            LEFT JOIN variant_values vv
                ON vv.variant_id = v2.id
            WHERE
                (:keyword IS NULL OR :keyword = ''
                 OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                 OR EXISTS (SELECT 1 FROM product_variants v_sku WHERE v_sku.product_id = p.id AND LOWER(v_sku.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))))
            AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds))
            AND (:isActive IS NULL OR p.is_active = :isActive)
            AND (:minPrice IS NULL OR EXISTS (
                SELECT 1
                FROM product_variants v3
                WHERE v3.product_id = p.id
                  AND v3.price >= :minPrice
            ))
            AND (:maxPrice IS NULL OR EXISTS (
                SELECT 1
                FROM product_variants v4
                WHERE v4.product_id = p.id
                  AND v4.price <= :maxPrice
            ))

            GROUP BY p.id

            HAVING
                (:hasAttributeValueIds = false OR
                    COUNT(DISTINCT
                        CASE
                            WHEN vv.attribute_value_id IN (:attributeValueIds)
                            THEN vv.attribute_value_id
                        END
                    ) = :attrCount
                )
        ) AS count_table
        """,

                nativeQuery = true
        )
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
                Pageable pageable
        );

        @Query(value = """
        SELECT MIN(v.price)
        FROM product_variants v
        JOIN products p ON v.product_id = p.id

        WHERE
            (:keyword IS NULL OR :keyword = ''
             OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR EXISTS (SELECT 1 FROM product_variants v_sku WHERE v_sku.product_id = p.id AND LOWER(v_sku.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))))

        AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds))

        AND (:isActive IS NULL OR p.is_active = :isActive)

        AND (:hasAttributeValueIds = false OR EXISTS (
            SELECT 1
            FROM variant_values vv
            WHERE vv.variant_id = v.id
              AND vv.attribute_value_id IN (:attributeValueIds)
            GROUP BY vv.variant_id
            HAVING COUNT(DISTINCT vv.attribute_value_id) = :attrCount
        ))
        """, nativeQuery = true)
        BigDecimal findMinPriceByFilters(
                @Param("keyword") String keyword,
                @Param("hasCategoryIds") boolean hasCategoryIds,
                @Param("categoryIds") List<Long> categoryIds,
                @Param("isActive") Boolean isActive,
                @Param("hasAttributeValueIds") boolean hasAttributeValueIds,
                @Param("attributeValueIds") List<Long> attributeValueIds,
                @Param("attrCount") Long attrCount
        );

        @Query(value = """
        SELECT MAX(v.price)
        FROM product_variants v
        JOIN products p ON v.product_id = p.id

        WHERE
            (:keyword IS NULL OR :keyword = ''
             OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR EXISTS (SELECT 1 FROM product_variants v_sku WHERE v_sku.product_id = p.id AND LOWER(v_sku.sku) LIKE LOWER(CONCAT('%', :keyword, '%'))))

        AND (:hasCategoryIds = false OR p.category_id IN (:categoryIds))

        AND (:isActive IS NULL OR p.is_active = :isActive)

        AND (:hasAttributeValueIds = false OR EXISTS (
            SELECT 1
            FROM variant_values vv
            WHERE vv.variant_id = v.id
              AND vv.attribute_value_id IN (:attributeValueIds)
            GROUP BY vv.variant_id
            HAVING COUNT(DISTINCT vv.attribute_value_id) = :attrCount
        ))
        """, nativeQuery = true)
        BigDecimal findMaxPriceByFilters(
                @Param("keyword") String keyword,
                @Param("hasCategoryIds") boolean hasCategoryIds,
                @Param("categoryIds") List<Long> categoryIds,
                @Param("isActive") Boolean isActive,
                @Param("hasAttributeValueIds") boolean hasAttributeValueIds,
                @Param("attributeValueIds") List<Long> attributeValueIds,
                @Param("attrCount") Long attrCount
        );

        boolean existsBySlug(String slug);

        Optional<Product> findBySlug(String slug);

        @Query(value = """
        SELECT *
        FROM products
        WHERE is_active = true
        ORDER BY average_rating DESC, review_count DESC, created_at DESC
        LIMIT 4
        """, nativeQuery = true)
        List<Product> findFeaturedProducts();
}