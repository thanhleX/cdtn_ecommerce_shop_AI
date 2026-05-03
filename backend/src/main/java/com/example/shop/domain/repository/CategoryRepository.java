package com.example.shop.domain.repository;

import com.example.shop.domain.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNull();
    List<Category> findByParentIsNullAndIsActiveTrue();
    List<Category> findByParentAndIsActiveTrue(Category parent);
    boolean existsBySlug(String slug);
}
