package com.example.shop.application.service;

import com.example.shop.application.dto.common.PageResponse;
import com.example.shop.application.dto.request.ImageRequest;
import com.example.shop.application.dto.request.ProductRequest;
import com.example.shop.application.dto.request.VariantRequest;
import com.example.shop.application.dto.response.ProductResponse;
import com.example.shop.application.mapper.ProductMapper;
import com.example.shop.domain.entity.Category;
import com.example.shop.domain.entity.Product;
import com.example.shop.domain.entity.ProductImage;
import com.example.shop.domain.entity.ProductVariant;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.CategoryRepository;
import com.example.shop.domain.repository.ProductRepository;
import com.example.shop.infrastructure.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final com.example.shop.domain.repository.AttributeValueRepository attributeValueRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(String keyword, List<Long> categoryIds, BigDecimal minPrice, BigDecimal maxPrice,
            Boolean isActive, List<Long> attributeValueIds, Pageable pageable) {
        List<Long> expandedCategoryIds = null;
        if (categoryIds != null && !categoryIds.isEmpty()) {
            expandedCategoryIds = getAllCategoryIdsRecursive(categoryIds);
        }

        boolean hasCategoryIds = expandedCategoryIds != null && !expandedCategoryIds.isEmpty();
        boolean hasAttributeValueIds = attributeValueIds != null && !attributeValueIds.isEmpty();

        Long attrCount = hasAttributeValueIds ? (long) attributeValueIds.size() : 0L;

        // Xử lý danh sách rỗng để tránh lỗi SQL IN ()
        List<Long> finalCategoryIds = hasCategoryIds ? expandedCategoryIds : List.of(-1L);
        List<Long> finalAttrIds = hasAttributeValueIds ? attributeValueIds : List.of(-1L);

        Page<Product> productPage = productRepository.findByFilters(
                keyword, 
                hasCategoryIds, finalCategoryIds, 
                minPrice, maxPrice, isActive,
                hasAttributeValueIds, finalAttrIds, 
                attrCount,
                pageable);

        BigDecimal dynamicMin = productRepository.findMinPriceByFilters(
                keyword, 
                hasCategoryIds, finalCategoryIds, 
                isActive, 
                hasAttributeValueIds, finalAttrIds, 
                attrCount);
        
        BigDecimal dynamicMax = productRepository.findMaxPriceByFilters(
                keyword, 
                hasCategoryIds, finalCategoryIds, 
                isActive, 
                hasAttributeValueIds, finalAttrIds, 
                attrCount);

        PageResponse<ProductResponse> response = PageResponse.of(
                productPage.map(productMapper::toProductResponse));
        
        response.setMinPrice(dynamicMin);
        response.setMaxPrice(dynamicMax);
        
        return response;
    }

    private List<Long> getAllCategoryIdsRecursive(List<Long> categoryIds) {
        List<Long> allIds = new ArrayList<>(categoryIds);
        for (Long id : categoryIds) {
            Category category = categoryRepository.findById(id).orElse(null);
            if (category != null && Boolean.TRUE.equals(category.getIsActive())) {
                List<Category> children = categoryRepository.findByParentAndIsActiveTrue(category);
                if (!children.isEmpty()) {
                    List<Long> childIds = children.stream().map(Category::getId).toList();
                    allIds.addAll(getAllCategoryIdsRecursive(childIds));
                }
            }
        }
        return allIds.stream().distinct().toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findFeaturedProducts().stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String slug = SlugUtils.toSlug(request.getName());
        int count = 1;
        String originalSlug = slug;
        while (productRepository.existsBySlug(slug)) {
            slug = originalSlug + "-" + count++;
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        Product product = productMapper.toProduct(request);
        product.setSlug(slug);
        product.setCategory(category);

        // Handle variants
        if (product.getVariants() == null) {
            product.setVariants(new ArrayList<>());
        }

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            // Case 1: Multiple variants provided
            for (VariantRequest vRequest : request.getVariants()) {
                ProductVariant variant = productMapper.toVariant(vRequest);
                variant.setProduct(product);
                if (vRequest.getAttributeValueIds() != null) {
                    variant.setAttributeValues(attributeValueRepository.findAllById(vRequest.getAttributeValueIds()));
                }
                product.getVariants().add(variant);
            }
        } else if (request.getSku() != null && request.getPrice() != null && request.getQuantity() != null) {
            // Case 2: Simple product (No variants list, use top-level fields)
            ProductVariant defaultVariant = new ProductVariant();
            defaultVariant.setSku(request.getSku());
            defaultVariant.setPrice(request.getPrice());
            defaultVariant.setQuantity(request.getQuantity());
            defaultVariant.setIsActive(true);
            defaultVariant.setProduct(product);
            product.getVariants().add(defaultVariant);
        }

        // Handle images
        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }
        if (request.getImages() != null) {
            for (ImageRequest iRequest : request.getImages()) {
                ProductImage image = productMapper.toImage(iRequest);
                image.setProduct(product);
                product.getImages().add(image);
            }
        }

        updateActiveStatusByStock(product);

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!product.getName().equals(request.getName())) {
            String slug = SlugUtils.toSlug(request.getName());
            int count = 1;
            String originalSlug = slug;
            while (productRepository.existsBySlug(slug) && !product.getSlug().equals(slug)) {
                slug = originalSlug + "-" + count++;
            }
            product.setSlug(slug);
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        productMapper.updateProduct(product, request);
        product.setCategory(category);

        // Update variants
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> existingVariants = product.getVariants();
            List<ProductVariant> newVariants = new ArrayList<>();

            for (VariantRequest vRequest : request.getVariants()) {
                if (vRequest.getId() != null) {
                    ProductVariant existing = existingVariants.stream()
                            .filter(v -> v.getId().equals(vRequest.getId()))
                            .findFirst()
                            .orElse(null);
                    if (existing != null) {
                        productMapper.updateVariant(existing, vRequest);
                        if (vRequest.getAttributeValueIds() != null) {
                            existing.setAttributeValues(attributeValueRepository.findAllById(vRequest.getAttributeValueIds()));
                        }
                        newVariants.add(existing);
                    } else {
                        ProductVariant variant = productMapper.toVariant(vRequest);
                        variant.setProduct(product);
                        if (vRequest.getAttributeValueIds() != null) {
                            variant.setAttributeValues(attributeValueRepository.findAllById(vRequest.getAttributeValueIds()));
                        }
                        newVariants.add(variant);
                    }
                } else {
                    ProductVariant variant = productMapper.toVariant(vRequest);
                    variant.setProduct(product);
                    if (vRequest.getAttributeValueIds() != null) {
                        variant.setAttributeValues(attributeValueRepository.findAllById(vRequest.getAttributeValueIds()));
                    }
                    newVariants.add(variant);
                }
            }
            existingVariants.clear();
            existingVariants.addAll(newVariants);
        } else if (request.getSku() != null && request.getPrice() != null && request.getQuantity() != null) {
            // Update as Simple Product (keep only one default variant)
            product.getVariants().clear();
            ProductVariant defaultVariant = new ProductVariant();
            defaultVariant.setSku(request.getSku());
            defaultVariant.setPrice(request.getPrice());
            defaultVariant.setQuantity(request.getQuantity());
            defaultVariant.setIsActive(true);
            defaultVariant.setProduct(product);
            product.getVariants().add(defaultVariant);
        } else if (request.getVariants() != null) {
            product.getVariants().clear();
        }

        // Update images (simplified: clear and re-add)
        product.getImages().clear();
        if (request.getImages() != null) {
            for (ImageRequest iRequest : request.getImages()) {
                ProductImage image = productMapper.toImage(iRequest);
                image.setProduct(product);
                product.getImages().add(image);
            }
        }

        updateActiveStatusByStock(product);

        return productMapper.toProductResponse(productRepository.save(product));
    }

    private void updateActiveStatusByStock(Product product) {
        if (product.getVariants() == null || product.getVariants().isEmpty()) {
            product.setIsActive(false);
            return;
        }
        int totalQuantity = product.getVariants().stream()
                .filter(v -> v.getQuantity() != null)
                .mapToInt(ProductVariant::getQuantity)
                .sum();
        if (totalQuantity <= 0) {
            product.setIsActive(false);
        }
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setIsActive(false);
        productRepository.save(product);
    }
}
