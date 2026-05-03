package com.example.shop.api.controller;

import com.example.shop.application.dto.common.ApiResponse;
import com.example.shop.application.dto.request.AddressRequest;
import com.example.shop.application.dto.response.AddressResponse;
import com.example.shop.application.service.AddressService;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.exception.UnauthorizedException;
import com.example.shop.infrastructure.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_CUSTOMER')")
public class AddressController {

    private final AddressService addressService;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getUserAddresses() {
        List<AddressResponse> addresses = addressService.getUserAddresses(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(addresses, "Lấy danh sách địa chỉ thành công"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(@Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.createAddress(getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(address, "Tạo địa chỉ mới thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long id, @Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.updateAddress(getCurrentUserId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(address, "Cập nhật địa chỉ thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(getCurrentUserId(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa địa chỉ thành công"));
    }
}
