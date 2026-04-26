package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.BlogCategoryRequest;
import com.example.shop.application.dto.response.BlogCategoryResponse;
import com.example.shop.domain.entity.BlogCategory;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-26T22:41:44+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class BlogCategoryMapperImpl implements BlogCategoryMapper {

    @Override
    public BlogCategory toEntity(BlogCategoryRequest request) {
        if ( request == null ) {
            return null;
        }

        BlogCategory.BlogCategoryBuilder blogCategory = BlogCategory.builder();

        blogCategory.name( request.getName() );
        blogCategory.slug( request.getSlug() );
        blogCategory.isActive( request.getIsActive() );

        return blogCategory.build();
    }

    @Override
    public BlogCategoryResponse toResponse(BlogCategory blogCategory) {
        if ( blogCategory == null ) {
            return null;
        }

        BlogCategoryResponse.BlogCategoryResponseBuilder blogCategoryResponse = BlogCategoryResponse.builder();

        blogCategoryResponse.id( blogCategory.getId() );
        blogCategoryResponse.name( blogCategory.getName() );
        blogCategoryResponse.slug( blogCategory.getSlug() );
        blogCategoryResponse.isActive( blogCategory.getIsActive() );

        return blogCategoryResponse.build();
    }
}
