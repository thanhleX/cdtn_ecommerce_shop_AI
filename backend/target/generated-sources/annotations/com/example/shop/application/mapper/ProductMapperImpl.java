package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.ImageRequest;
import com.example.shop.application.dto.request.ProductRequest;
import com.example.shop.application.dto.request.VariantRequest;
import com.example.shop.application.dto.response.AttributeValueResponse;
import com.example.shop.application.dto.response.ImageResponse;
import com.example.shop.application.dto.response.ProductResponse;
import com.example.shop.application.dto.response.VariantResponse;
import com.example.shop.domain.entity.AttributeValue;
import com.example.shop.domain.entity.Category;
import com.example.shop.domain.entity.Product;
import com.example.shop.domain.entity.ProductImage;
import com.example.shop.domain.entity.ProductVariant;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-30T14:13:09+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Autowired
    private AttributeMapper attributeMapper;

    @Override
    public Product toProduct(ProductRequest request) {
        if ( request == null ) {
            return null;
        }

        Product.ProductBuilder product = Product.builder();

        product.name( request.getName() );
        product.description( request.getDescription() );
        product.isActive( request.getIsActive() );

        return product.build();
    }

    @Override
    public ProductResponse toProductResponse(Product product) {
        if ( product == null ) {
            return null;
        }

        ProductResponse.ProductResponseBuilder productResponse = ProductResponse.builder();

        productResponse.categoryId( productCategoryId( product ) );
        productResponse.categoryName( productCategoryName( product ) );
        productResponse.id( product.getId() );
        productResponse.name( product.getName() );
        productResponse.slug( product.getSlug() );
        productResponse.description( product.getDescription() );
        productResponse.isActive( product.getIsActive() );
        productResponse.variants( productVariantListToVariantResponseList( product.getVariants() ) );
        productResponse.images( productImageListToImageResponseList( product.getImages() ) );
        productResponse.createdAt( product.getCreatedAt() );
        productResponse.updatedAt( product.getUpdatedAt() );

        return productResponse.build();
    }

    @Override
    public List<ProductResponse> toProductResponseList(List<Product> products) {
        if ( products == null ) {
            return null;
        }

        List<ProductResponse> list = new ArrayList<ProductResponse>( products.size() );
        for ( Product product : products ) {
            list.add( toProductResponse( product ) );
        }

        return list;
    }

    @Override
    public void updateProduct(Product product, ProductRequest request) {
        if ( request == null ) {
            return;
        }

        product.setName( request.getName() );
        product.setDescription( request.getDescription() );
        product.setIsActive( request.getIsActive() );
    }

    @Override
    public ProductVariant toVariant(VariantRequest request) {
        if ( request == null ) {
            return null;
        }

        ProductVariant.ProductVariantBuilder productVariant = ProductVariant.builder();

        productVariant.sku( request.getSku() );
        productVariant.price( request.getPrice() );
        productVariant.quantity( request.getQuantity() );
        productVariant.isActive( request.getIsActive() );

        return productVariant.build();
    }

    @Override
    public VariantResponse toVariantResponse(ProductVariant variant) {
        if ( variant == null ) {
            return null;
        }

        VariantResponse.VariantResponseBuilder variantResponse = VariantResponse.builder();

        variantResponse.id( variant.getId() );
        variantResponse.sku( variant.getSku() );
        variantResponse.attributeValues( attributeValueListToAttributeValueResponseList( variant.getAttributeValues() ) );
        variantResponse.price( variant.getPrice() );
        variantResponse.quantity( variant.getQuantity() );
        variantResponse.isActive( variant.getIsActive() );

        return variantResponse.build();
    }

    @Override
    public void updateVariant(ProductVariant variant, VariantRequest request) {
        if ( request == null ) {
            return;
        }

        variant.setId( request.getId() );
        variant.setSku( request.getSku() );
        variant.setPrice( request.getPrice() );
        variant.setQuantity( request.getQuantity() );
        variant.setIsActive( request.getIsActive() );
    }

    @Override
    public ProductImage toImage(ImageRequest request) {
        if ( request == null ) {
            return null;
        }

        ProductImage.ProductImageBuilder productImage = ProductImage.builder();

        productImage.imageUrl( request.getImageUrl() );
        productImage.isThumbnail( request.getIsThumbnail() );
        productImage.sortOrder( request.getSortOrder() );

        return productImage.build();
    }

    @Override
    public ImageResponse toImageResponse(ProductImage image) {
        if ( image == null ) {
            return null;
        }

        ImageResponse.ImageResponseBuilder imageResponse = ImageResponse.builder();

        imageResponse.id( image.getId() );
        imageResponse.imageUrl( image.getImageUrl() );
        imageResponse.isThumbnail( image.getIsThumbnail() );
        imageResponse.sortOrder( image.getSortOrder() );

        return imageResponse.build();
    }

    private Long productCategoryId(Product product) {
        if ( product == null ) {
            return null;
        }
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        Long id = category.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String productCategoryName(Product product) {
        if ( product == null ) {
            return null;
        }
        Category category = product.getCategory();
        if ( category == null ) {
            return null;
        }
        String name = category.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    protected List<VariantResponse> productVariantListToVariantResponseList(List<ProductVariant> list) {
        if ( list == null ) {
            return null;
        }

        List<VariantResponse> list1 = new ArrayList<VariantResponse>( list.size() );
        for ( ProductVariant productVariant : list ) {
            list1.add( toVariantResponse( productVariant ) );
        }

        return list1;
    }

    protected List<ImageResponse> productImageListToImageResponseList(List<ProductImage> list) {
        if ( list == null ) {
            return null;
        }

        List<ImageResponse> list1 = new ArrayList<ImageResponse>( list.size() );
        for ( ProductImage productImage : list ) {
            list1.add( toImageResponse( productImage ) );
        }

        return list1;
    }

    protected List<AttributeValueResponse> attributeValueListToAttributeValueResponseList(List<AttributeValue> list) {
        if ( list == null ) {
            return null;
        }

        List<AttributeValueResponse> list1 = new ArrayList<AttributeValueResponse>( list.size() );
        for ( AttributeValue attributeValue : list ) {
            list1.add( attributeMapper.toAttributeValueResponse( attributeValue ) );
        }

        return list1;
    }
}
