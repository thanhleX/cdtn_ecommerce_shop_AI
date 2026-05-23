package com.example.shop.api.controller;

import com.example.shop.application.dto.common.ApiResponse;
import com.example.shop.application.dto.request.VoucherRequest;
import com.example.shop.application.dto.response.VoucherResponse;
import com.example.shop.application.service.VoucherService;
import com.example.shop.domain.entity.Voucher;
import com.example.shop.application.mapper.VoucherMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;
    private final VoucherMapper voucherMapper;

    @GetMapping("/admin/vouchers")
    @PreAuthorize("hasAuthority('voucher:manage')")
    public ResponseEntity<ApiResponse<Page<VoucherResponse>>> getAllVouchers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity
                .ok(ApiResponse.success(voucherService.getAllVouchers(keyword, pageable), "Lấy danh sách Voucher thành công"));
    }

    @PostMapping("/admin/vouchers")
    @PreAuthorize("hasAuthority('voucher:manage')")
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@Valid @RequestBody VoucherRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(voucherService.createVoucher(request), "Tạo Voucher thành công"));
    }

    @PutMapping("/admin/vouchers/{id}")
    @PreAuthorize("hasAuthority('voucher:manage')")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(
            @PathVariable Long id, @Valid @RequestBody VoucherRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success(voucherService.updateVoucher(id, request), "Cập nhật Voucher thành công"));
    }

    @DeleteMapping("/admin/vouchers/{id}")
    @PreAuthorize("hasAuthority('voucher:manage')")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa Voucher thành công"));
    }

    @GetMapping("/vouchers/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateVoucher(
            @RequestParam String code,
            @RequestParam(required = false) Long userId,
            @RequestParam Double orderValue) {

        Voucher voucher = voucherService.validateVoucher(code, userId, orderValue);
        Double discount = voucherService.calculateDiscount(voucher, orderValue);
        VoucherResponse response = voucherMapper.toResponse(voucher);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "voucher", response,
                        "discount", discount,
                        "finalAmount", orderValue - discount),
                "Mã giảm giá hợp lệ"));
    }
}
