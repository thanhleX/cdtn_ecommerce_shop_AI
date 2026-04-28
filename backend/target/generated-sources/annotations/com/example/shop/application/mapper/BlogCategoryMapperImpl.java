package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.BlogCategoryRequest;
import com.example.shop.application.dto.response.BlogCategoryResponse;
import com.example.shop.domain.entity.BlogCategory;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-28T21:07:43+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class BlogCategoryMapperImpl implements BlogCategoryMapper {

    @Override
    public BlogCategory toEntity(BlogCategoryRequest request) {
        if ( request == null ) {
            return null;
        }

        BlogCategory.BlogCategoryBuilder blogCategory = BlogCategory.builder();

        blogCategory.isActive( request.getIsActive() );
        blogCategory.name( request.getName() );
        blogCategory.slug( request.getSlug() );

        return blogCategory.build();
    }

    @Override
    public BlogCategoryResponse toResponse(BlogCategory blogCategory) {
        if ( blogCategory == null ) {
            return null;
        }

        BlogCategoryResponse.BlogCategoryResponseBuilder blogCategoryResponse = BlogCategoryResponse.builder();

        blogCategoryResponse.id( blogCategory.getId() );
        blogCategoryResponse.isActive( blogCategory.getIsActive() );
        blogCategoryResponse.name( blogCategory.getName() );
        blogCategoryResponse.slug( blogCategory.getSlug() );

        return blogCategoryResponse.build();
    }
}
