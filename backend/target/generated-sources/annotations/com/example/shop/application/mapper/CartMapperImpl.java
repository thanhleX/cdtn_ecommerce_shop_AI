package com.example.shop.application.mapper;

import com.example.shop.application.dto.response.CartItemResponse;
import com.example.shop.application.dto.response.CartResponse;
import com.example.shop.domain.entity.Cart;
import com.example.shop.domain.entity.CartItem;
import com.example.shop.domain.entity.Product;
import com.example.shop.domain.entity.ProductImage;
import com.example.shop.domain.entity.ProductVariant;
import com.example.shop.domain.entity.User;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T14:35:28+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class CartMapperImpl implements CartMapper {

    @Override
    public CartResponse toCartResponse(Cart cart, List<CartItemResponse> items, BigDecimal totalPrice) {
        if ( cart == null && items == null && totalPrice == null ) {
            return null;
        }

        CartResponse.CartResponseBuilder cartResponse = CartResponse.builder();

        if ( cart != null ) {
            cartResponse.userId( cartUserId( cart ) );
            cartResponse.id( cart.getId() );
        }
        List<CartItemResponse> list = items;
        if ( list != null ) {
            cartResponse.items( new ArrayList<CartItemResponse>( list ) );
        }
        cartResponse.totalPrice( totalPrice );

        return cartResponse.build();
    }

    @Override
    public CartItemResponse toCartItemResponse(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }

        CartItemResponse.CartItemResponseBuilder cartItemResponse = CartItemResponse.builder();

        cartItemResponse.productVariantId( cartItemProductVariantId( cartItem ) );
        cartItemResponse.productName( cartItemProductVariantProductName( cartItem ) );
        cartItemResponse.productSlug( cartItemProductVariantProductSlug( cartItem ) );
        cartItemResponse.sku( cartItemProductVariantSku( cartItem ) );
        cartItemResponse.price( cartItemProductVariantPrice( cartItem ) );
        cartItemResponse.imageUrl( mapImageUrl( cartItemProductVariantProductImages( cartItem ) ) );
        cartItemResponse.id( cartItem.getId() );
        cartItemResponse.quantity( cartItem.getQuantity() );

        cartItemResponse.variantAttributes( cartItem.getProductVariant().getAttributesString() );

        return cartItemResponse.build();
    }

    private Long cartUserId(Cart cart) {
        if ( cart == null ) {
            return null;
        }
        User user = cart.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private Long cartItemProductVariantId(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Long id = productVariant.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String cartItemProductVariantProductName(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Product product = productVariant.getProduct();
        if ( product == null ) {
            return null;
        }
        String name = product.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private String cartItemProductVariantProductSlug(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Product product = productVariant.getProduct();
        if ( product == null ) {
            return null;
        }
        String slug = product.getSlug();
        if ( slug == null ) {
            return null;
        }
        return slug;
    }

    private String cartItemProductVariantSku(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        String sku = productVariant.getSku();
        if ( sku == null ) {
            return null;
        }
        return sku;
    }

    private BigDecimal cartItemProductVariantPrice(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        BigDecimal price = productVariant.getPrice();
        if ( price == null ) {
            return null;
        }
        return price;
    }

    private List<ProductImage> cartItemProductVariantProductImages(CartItem cartItem) {
        if ( cartItem == null ) {
            return null;
        }
        ProductVariant productVariant = cartItem.getProductVariant();
        if ( productVariant == null ) {
            return null;
        }
        Product product = productVariant.getProduct();
        if ( product == null ) {
            return null;
        }
        List<ProductImage> images = product.getImages();
        if ( images == null ) {
            return null;
        }
        return images;
    }
}
