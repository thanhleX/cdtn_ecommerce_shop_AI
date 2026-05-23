package com.example.shop.application.mapper;

import com.example.shop.application.dto.response.CartItemResponse;
import com.example.shop.application.dto.response.CartResponse;
import com.example.shop.domain.entity.Cart;
import com.example.shop.domain.entity.CartItem;
import com.example.shop.domain.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartMapper {

    @Mapping(source = "cart.user.id", target = "userId")
    CartResponse toCartResponse(Cart cart, List<CartItemResponse> items, BigDecimal totalPrice);

    @Mapping(source = "productVariant.id", target = "productVariantId")
    @Mapping(source = "productVariant.product.name", target = "productName")
    @Mapping(source = "productVariant.product.slug", target = "productSlug")
    @Mapping(target = "variantAttributes", expression = "java(cartItem.getProductVariant().getAttributesString())")
    @Mapping(source = "productVariant.sku", target = "sku")
    @Mapping(source = "productVariant.price", target = "price")
    @Mapping(source = "productVariant.product.images", target = "imageUrl", qualifiedByName = "mapImageUrl")
    @Mapping(source = "productVariant.product.isActive", target = "isActive")
    CartItemResponse toCartItemResponse(CartItem cartItem);

    @Named("mapImageUrl")
    default String mapImageUrl(List<ProductImage> images) {
        if (images == null || images.isEmpty()) return null;
        return images.stream()
                .filter(ProductImage::getIsThumbnail)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(images.get(0).getImageUrl());
    }
}
