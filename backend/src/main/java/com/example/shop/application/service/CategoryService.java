package com.example.shop.application.service;

import com.example.shop.application.dto.request.CategoryRequest;
import com.example.shop.application.dto.response.CategoryResponse;
import com.example.shop.application.mapper.CategoryMapper;
import com.example.shop.domain.entity.Category;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.CategoryRepository;
import com.example.shop.infrastructure.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree(Boolean activeOnly) {
        List<Category> rootCategories;
        if (Boolean.TRUE.equals(activeOnly)) {
            rootCategories = categoryRepository.findByParentIsNullAndIsActiveTrue();
            return rootCategories.stream()
                    .map(c -> toCategoryResponse(c, true))
                    .toList();
        } else {
            rootCategories = categoryRepository.findByParentIsNull();
            return rootCategories.stream()
                    .map(c -> toCategoryResponse(c, false))
                    .toList();
        }
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(Boolean activeOnly) {
        List<Category> categories;
        if (Boolean.TRUE.equals(activeOnly)) {
            categories = categoryRepository.findAll().stream()
                    .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                    .toList();
        } else {
            categories = categoryRepository.findAll();
        }
        return categoryMapper.toCategoryResponseList(categories);
    }

    private CategoryResponse toCategoryResponse(Category category, boolean activeOnly) {
        if (category == null) return null;
        if (activeOnly && !Boolean.TRUE.equals(category.getIsActive())) {
            return null;
        }

        CategoryResponse response = categoryMapper.toCategoryResponse(category);
        if (category.getChildren() != null) {
            List<CategoryResponse> mappedChildren = category.getChildren().stream()
                    .map(c -> toCategoryResponse(c, activeOnly))
                    .filter(Objects::nonNull)
                    .toList();
            response.setChildren(mappedChildren);
        }
        return response;
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String slug = SlugUtils.toSlug(request.getName());
        int count = 1;
        String originalSlug = slug;
        while (categoryRepository.existsBySlug(slug)) {
            slug = originalSlug + "-" + count++;
        }

        Category category = categoryMapper.toCategory(request);
        category.setSlug(slug);

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CATEGORY_PARENT));
            if (!Boolean.TRUE.equals(parent.getIsActive())) {
                throw new AppException(ErrorCode.INVALID_CATEGORY_PARENT);
            }
            category.setParent(parent);
            category.setImageUrl(null); // Chỉ category cha mới có ảnh
        }

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!category.getName().equals(request.getName())) {
            String slug = SlugUtils.toSlug(request.getName());
            int count = 1;
            String originalSlug = slug;
            while (categoryRepository.existsBySlug(slug) && !category.getSlug().equals(slug)) {
                slug = originalSlug + "-" + count++;
            }
            category.setSlug(slug);
        }

        categoryMapper.updateCategory(category, request);

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new AppException(ErrorCode.INVALID_CATEGORY_PARENT);
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CATEGORY_PARENT));
            if (!Boolean.TRUE.equals(parent.getIsActive())) {
                throw new AppException(ErrorCode.INVALID_CATEGORY_PARENT);
            }
            category.setParent(parent);
            category.setImageUrl(null); // Chỉ category cha mới có ảnh
        } else {
            category.setParent(null);
        }

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        softDeleteRecursive(category);
    }

    private void softDeleteRecursive(Category category) {
        category.setIsActive(false);
        categoryRepository.save(category);

        if (category.getChildren() != null) {
            for (Category child : category.getChildren()) {
                softDeleteRecursive(child);
            }
        }
    }
}
