package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.CategoryRequest;
import com.example.shop.application.dto.response.AttributeResponse;
import com.example.shop.application.dto.response.CategoryResponse;
import com.example.shop.domain.entity.Attribute;
import com.example.shop.domain.entity.Category;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-27T22:02:47+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.7 (Oracle Corporation)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Autowired
    private AttributeMapper attributeMapper;

    @Override
    public Category toCategory(CategoryRequest request) {
        if ( request == null ) {
            return null;
        }

        Category.CategoryBuilder category = Category.builder();

        category.name( request.getName() );
        category.isActive( request.getIsActive() );

        return category.build();
    }

    @Override
    public CategoryResponse toCategoryResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryResponse.CategoryResponseBuilder categoryResponse = CategoryResponse.builder();

        categoryResponse.parentId( categoryParentId( category ) );
        categoryResponse.children( toCategoryResponseList( category.getChildren() ) );
        categoryResponse.id( category.getId() );
        categoryResponse.name( category.getName() );
        categoryResponse.slug( category.getSlug() );
        categoryResponse.isActive( category.getIsActive() );
        categoryResponse.attributes( attributeListToAttributeResponseList( category.getAttributes() ) );

        return categoryResponse.build();
    }

    @Override
    public List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        if ( categories == null ) {
            return null;
        }

        List<CategoryResponse> list = new ArrayList<CategoryResponse>( categories.size() );
        for ( Category category : categories ) {
            list.add( toCategoryResponse( category ) );
        }

        return list;
    }

    @Override
    public void updateCategory(Category category, CategoryRequest request) {
        if ( request == null ) {
            return;
        }

        category.setName( request.getName() );
        category.setIsActive( request.getIsActive() );
    }

    private Long categoryParentId(Category category) {
        if ( category == null ) {
            return null;
        }
        Category parent = category.getParent();
        if ( parent == null ) {
            return null;
        }
        Long id = parent.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected List<AttributeResponse> attributeListToAttributeResponseList(List<Attribute> list) {
        if ( list == null ) {
            return null;
        }

        List<AttributeResponse> list1 = new ArrayList<AttributeResponse>( list.size() );
        for ( Attribute attribute : list ) {
            list1.add( attributeMapper.toAttributeResponse( attribute ) );
        }

        return list1;
    }
}
