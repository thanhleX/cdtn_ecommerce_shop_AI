package com.example.shop.application.service;

import com.example.shop.application.dto.request.AttributeRequest;
import com.example.shop.application.dto.request.AttributeValueRequest;
import com.example.shop.application.dto.response.AttributeResponse;
import com.example.shop.application.dto.response.AttributeValueResponse;
import com.example.shop.application.mapper.AttributeMapper;
import com.example.shop.domain.entity.Attribute;
import com.example.shop.domain.entity.AttributeValue;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.AttributeRepository;
import com.example.shop.domain.repository.AttributeValueRepository;
import com.example.shop.domain.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeValueRepository attributeValueRepository;
    private final CategoryRepository categoryRepository;
    private final AttributeMapper attributeMapper;

    @Transactional(readOnly = true)
    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll().stream()
                .map(attributeMapper::toAttributeResponse)
                .toList();
    }

    @Transactional
    public AttributeResponse createAttribute(AttributeRequest request) {
        if (attributeRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Cần định nghĩa ErrorCode cụ thể hơn sau
        }
        Attribute attribute = attributeMapper.toAttribute(request);
        return attributeMapper.toAttributeResponse(attributeRepository.save(attribute));
    }

    @Transactional
    public AttributeValueResponse addAttributeValue(AttributeValueRequest request) {
        Attribute attribute = attributeRepository.findById(request.getAttributeId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        
        AttributeValue attributeValue = attributeMapper.toAttributeValue(request);
        attributeValue.setAttribute(attribute);
        
        return attributeMapper.toAttributeValueResponse(attributeValueRepository.save(attributeValue));
    }

    @Transactional
    public void assignAttributeToCategory(Long categoryId, Long attributeId) {
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        var attribute = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        
        if (!category.getAttributes().contains(attribute)) {
            category.getAttributes().add(attribute);
            categoryRepository.save(category);
        }
    }

    @Transactional
    public void removeAttributeFromCategory(Long categoryId, Long attributeId) {
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        var attribute = attributeRepository.findById(attributeId)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        
        category.getAttributes().remove(attribute);
        categoryRepository.save(category);
    }

    @Transactional
    public AttributeResponse updateAttribute(Long id, AttributeRequest request) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
        
        attribute.setName(request.getName());
        attribute.setDisplayType(request.getDisplayType());
        attribute.setIsFilterable(request.getIsFilterable());
        attribute.setIsPricing(request.getIsPricing());
        
        return attributeMapper.toAttributeResponse(attributeRepository.save(attribute));
    }

    @Transactional
    public void deleteAttribute(Long id) {
        if (!attributeRepository.existsById(id)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        attributeRepository.deleteById(id);
    }

    @Transactional
    public void deleteAttributeValue(Long valueId) {
        if (!attributeValueRepository.existsById(valueId)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        attributeValueRepository.deleteById(valueId);
    }
}
