package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.ImageRequest;
import com.example.shop.application.dto.request.ProductRequest;
import com.example.shop.application.dto.request.VariantRequest;
import com.example.shop.application.dto.response.ImageResponse;
import com.example.shop.application.dto.response.ProductResponse;
import com.example.shop.application.dto.response.VariantResponse;
import com.example.shop.domain.entity.Product;
import com.example.shop.domain.entity.ProductImage;
import com.example.shop.domain.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {AttributeMapper.class})
public interface ProductMapper {

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product toProduct(ProductRequest request);

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ProductResponse toProductResponse(Product product);

    List<ProductResponse> toProductResponseList(List<Product> products);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    void updateProduct(@MappingTarget Product product, ProductRequest request);

    @Mapping(target = "product", ignore = true)
    ProductVariant toVariant(VariantRequest request);

    VariantResponse toVariantResponse(ProductVariant variant);

    @Mapping(target = "product", ignore = true)
    void updateVariant(@MappingTarget ProductVariant variant, VariantRequest request);

    @Mapping(target = "product", ignore = true)
    ProductImage toImage(ImageRequest request);

    ImageResponse toImageResponse(ProductImage image);
}
