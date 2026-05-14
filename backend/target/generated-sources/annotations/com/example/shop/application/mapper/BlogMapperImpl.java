package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.BlogRequest;
import com.example.shop.application.dto.response.BlogResponse;
import com.example.shop.domain.entity.Blog;
import com.example.shop.domain.entity.BlogCategory;
import com.example.shop.domain.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-14T13:50:36+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class BlogMapperImpl implements BlogMapper {

    @Override
    public Blog toEntity(BlogRequest request) {
        if ( request == null ) {
            return null;
        }

        Blog.BlogBuilder blog = Blog.builder();

        blog.title( request.getTitle() );
        blog.slug( request.getSlug() );
        blog.content( request.getContent() );
        blog.thumbnail( request.getThumbnail() );
        blog.isPublished( request.getIsPublished() );
        blog.isFeatured( request.getIsFeatured() );
        blog.carouselOrder( request.getCarouselOrder() );

        return blog.build();
    }

    @Override
    public BlogResponse toResponse(Blog blog) {
        if ( blog == null ) {
            return null;
        }

        BlogResponse.BlogResponseBuilder blogResponse = BlogResponse.builder();

        blogResponse.authorName( blogUserFullName( blog ) );
        blogResponse.categoryName( blogBlogCategoryName( blog ) );
        blogResponse.blogCategoryId( blogBlogCategoryId( blog ) );
        blogResponse.carouselOrder( blog.getCarouselOrder() );
        blogResponse.content( blog.getContent() );
        blogResponse.createdAt( blog.getCreatedAt() );
        blogResponse.id( blog.getId() );
        blogResponse.isFeatured( blog.getIsFeatured() );
        blogResponse.isPublished( blog.getIsPublished() );
        blogResponse.slug( blog.getSlug() );
        blogResponse.thumbnail( blog.getThumbnail() );
        blogResponse.title( blog.getTitle() );
        blogResponse.updatedAt( blog.getUpdatedAt() );

        return blogResponse.build();
    }

    private String blogUserFullName(Blog blog) {
        if ( blog == null ) {
            return null;
        }
        User user = blog.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String blogBlogCategoryName(Blog blog) {
        if ( blog == null ) {
            return null;
        }
        BlogCategory blogCategory = blog.getBlogCategory();
        if ( blogCategory == null ) {
            return null;
        }
        String name = blogCategory.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private Long blogBlogCategoryId(Blog blog) {
        if ( blog == null ) {
            return null;
        }
        BlogCategory blogCategory = blog.getBlogCategory();
        if ( blogCategory == null ) {
            return null;
        }
        Long id = blogCategory.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
