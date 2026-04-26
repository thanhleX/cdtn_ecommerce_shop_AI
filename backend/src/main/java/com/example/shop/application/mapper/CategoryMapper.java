package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.CategoryRequest;
import com.example.shop.application.dto.response.CategoryResponse;
import com.example.shop.domain.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", 
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {AttributeMapper.class})
public interface CategoryMapper {

    @Mapping(target = "parent", ignore = true)
    Category toCategory(CategoryRequest request);

    @Mapping(source = "parent.id", target = "parentId")
    @Mapping(source = "children", target = "children")
    CategoryResponse toCategoryResponse(Category category);

    List<CategoryResponse> toCategoryResponseList(List<Category> categories);

    @Mapping(target = "parent", ignore = true)
    void updateCategory(@MappingTarget Category category, CategoryRequest request);
}
