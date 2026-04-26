package com.example.shop.api.controller;

import com.example.shop.application.dto.request.AttributeRequest;
import com.example.shop.application.dto.request.AttributeValueRequest;
import com.example.shop.application.dto.common.ApiResponse;
import com.example.shop.application.dto.response.AttributeResponse;
import com.example.shop.application.dto.response.AttributeValueResponse;
import com.example.shop.application.service.AttributeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attributes")
@RequiredArgsConstructor
public class AdminAttributeController {

    private final AttributeService attributeService;

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('product:read')")
    public ResponseEntity<ApiResponse<List<AttributeResponse>>> getAllAttributes() {
        return ResponseEntity.ok(
                ApiResponse.success(attributeService.getAllAttributes(), "Lấy danh sách thuộc tính thành công")
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('product:create')")
    public ResponseEntity<ApiResponse<AttributeResponse>> createAttribute(@RequestBody AttributeRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(attributeService.createAttribute(request), "Tạo thuộc tính thành công")
        );
    }

    @PostMapping("/values")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('product:create')")
    public ResponseEntity<ApiResponse<AttributeValueResponse>> addAttributeValue(@RequestBody AttributeValueRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(attributeService.addAttributeValue(request), "Thêm giá trị thuộc tính thành công")
        );
    }

    @PostMapping("/categories/{categoryId}/assign/{attributeId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('category:manage')")
    public ResponseEntity<ApiResponse<Void>> assignAttributeToCategory(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId) {
        attributeService.assignAttributeToCategory(categoryId, attributeId);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Gán thuộc tính vào danh mục thành công")
        );
    }

    @DeleteMapping("/categories/{categoryId}/remove/{attributeId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('category:manage')")
    public ResponseEntity<ApiResponse<Void>> removeAttributeFromCategory(
            @PathVariable Long categoryId,
            @PathVariable Long attributeId) {
        attributeService.removeAttributeFromCategory(categoryId, attributeId);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Gỡ thuộc tính khỏi danh mục thành công")
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('product:update')")
    public ResponseEntity<ApiResponse<AttributeResponse>> updateAttribute(
            @PathVariable Long id,
            @RequestBody AttributeRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(attributeService.updateAttribute(id, request), "Cập nhật thuộc tính thành công")
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('product:delete')")
    public ResponseEntity<ApiResponse<Void>> deleteAttribute(@PathVariable Long id) {
        attributeService.deleteAttribute(id);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Xóa thuộc tính thành công")
        );
    }

    @DeleteMapping("/values/{valueId}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('product:delete')")
    public ResponseEntity<ApiResponse<Void>> deleteAttributeValue(@PathVariable Long valueId) {
        attributeService.deleteAttributeValue(valueId);
        return ResponseEntity.ok(
                ApiResponse.success(null, "Xóa giá trị thuộc tính thành công")
        );
    }
}
