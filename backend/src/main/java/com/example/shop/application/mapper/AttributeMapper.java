package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.AttributeRequest;
import com.example.shop.application.dto.request.AttributeValueRequest;
import com.example.shop.application.dto.response.AttributeResponse;
import com.example.shop.application.dto.response.AttributeValueResponse;
import com.example.shop.domain.entity.Attribute;
import com.example.shop.domain.entity.AttributeValue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AttributeMapper {

    Attribute toAttribute(AttributeRequest request);

    AttributeResponse toAttributeResponse(Attribute attribute);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "values", ignore = true)
    void updateAttribute(@MappingTarget Attribute attribute, AttributeRequest request);

    @Mapping(target = "attributeId", source = "attribute.id")
    @Mapping(target = "attributeName", source = "attribute.name")
    @Mapping(target = "isPricing", source = "attribute.isPricing")
    AttributeValueResponse toAttributeValueResponse(AttributeValue attributeValue);

    @Mapping(target = "attribute", ignore = true)
    AttributeValue toAttributeValue(AttributeValueRequest request);
}
