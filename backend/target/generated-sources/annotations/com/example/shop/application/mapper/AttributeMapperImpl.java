package com.example.shop.application.mapper;

import com.example.shop.application.dto.request.AttributeRequest;
import com.example.shop.application.dto.request.AttributeValueRequest;
import com.example.shop.application.dto.response.AttributeResponse;
import com.example.shop.application.dto.response.AttributeValueResponse;
import com.example.shop.domain.entity.Attribute;
import com.example.shop.domain.entity.AttributeValue;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-28T21:07:44+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.0.v20260407-0427, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class AttributeMapperImpl implements AttributeMapper {

    @Override
    public Attribute toAttribute(AttributeRequest request) {
        if ( request == null ) {
            return null;
        }

        Attribute.AttributeBuilder attribute = Attribute.builder();

        attribute.displayType( request.getDisplayType() );
        attribute.isFilterable( request.getIsFilterable() );
        attribute.isPricing( request.getIsPricing() );
        attribute.name( request.getName() );

        return attribute.build();
    }

    @Override
    public AttributeResponse toAttributeResponse(Attribute attribute) {
        if ( attribute == null ) {
            return null;
        }

        AttributeResponse.AttributeResponseBuilder attributeResponse = AttributeResponse.builder();

        attributeResponse.displayType( attribute.getDisplayType() );
        attributeResponse.id( attribute.getId() );
        attributeResponse.isFilterable( attribute.getIsFilterable() );
        attributeResponse.isPricing( attribute.getIsPricing() );
        attributeResponse.name( attribute.getName() );
        attributeResponse.values( attributeValueListToAttributeValueResponseList( attribute.getValues() ) );

        return attributeResponse.build();
    }

    @Override
    public void updateAttribute(Attribute attribute, AttributeRequest request) {
        if ( request == null ) {
            return;
        }

        attribute.setDisplayType( request.getDisplayType() );
        attribute.setIsFilterable( request.getIsFilterable() );
        attribute.setIsPricing( request.getIsPricing() );
        attribute.setName( request.getName() );
    }

    @Override
    public AttributeValueResponse toAttributeValueResponse(AttributeValue attributeValue) {
        if ( attributeValue == null ) {
            return null;
        }

        AttributeValueResponse.AttributeValueResponseBuilder attributeValueResponse = AttributeValueResponse.builder();

        attributeValueResponse.attributeId( attributeValueAttributeId( attributeValue ) );
        attributeValueResponse.attributeName( attributeValueAttributeName( attributeValue ) );
        attributeValueResponse.isPricing( attributeValueAttributeIsPricing( attributeValue ) );
        attributeValueResponse.id( attributeValue.getId() );
        attributeValueResponse.value( attributeValue.getValue() );

        return attributeValueResponse.build();
    }

    @Override
    public AttributeValue toAttributeValue(AttributeValueRequest request) {
        if ( request == null ) {
            return null;
        }

        AttributeValue.AttributeValueBuilder attributeValue = AttributeValue.builder();

        attributeValue.value( request.getValue() );

        return attributeValue.build();
    }

    protected List<AttributeValueResponse> attributeValueListToAttributeValueResponseList(List<AttributeValue> list) {
        if ( list == null ) {
            return null;
        }

        List<AttributeValueResponse> list1 = new ArrayList<AttributeValueResponse>( list.size() );
        for ( AttributeValue attributeValue : list ) {
            list1.add( toAttributeValueResponse( attributeValue ) );
        }

        return list1;
    }

    private Long attributeValueAttributeId(AttributeValue attributeValue) {
        if ( attributeValue == null ) {
            return null;
        }
        Attribute attribute = attributeValue.getAttribute();
        if ( attribute == null ) {
            return null;
        }
        Long id = attribute.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String attributeValueAttributeName(AttributeValue attributeValue) {
        if ( attributeValue == null ) {
            return null;
        }
        Attribute attribute = attributeValue.getAttribute();
        if ( attribute == null ) {
            return null;
        }
        String name = attribute.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private Boolean attributeValueAttributeIsPricing(AttributeValue attributeValue) {
        if ( attributeValue == null ) {
            return null;
        }
        Attribute attribute = attributeValue.getAttribute();
        if ( attribute == null ) {
            return null;
        }
        Boolean isPricing = attribute.getIsPricing();
        if ( isPricing == null ) {
            return null;
        }
        return isPricing;
    }
}
