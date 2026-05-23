package com.example.shop.application.service;

import com.example.shop.application.dto.request.VoucherRequest;
import com.example.shop.application.dto.response.VoucherResponse;
import com.example.shop.application.mapper.VoucherMapper;
import com.example.shop.domain.entity.User;
import com.example.shop.domain.entity.Voucher;
import com.example.shop.domain.enums.VoucherStatus;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.UserRepository;
import com.example.shop.domain.repository.VoucherRepository;
import com.example.shop.domain.repository.VoucherUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final UserRepository userRepository;
    private final VoucherMapper voucherMapper;

    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        if (request.getType() == com.example.shop.domain.enums.VoucherType.PERCENT && request.getValue() > 100) {
            throw new AppException(ErrorCode.INVALID_VOUCHER_VALUE);
        }
        if (voucherRepository.findByCode(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.DUPLICATE_CODE);
        }
        Voucher voucher = voucherMapper.toEntity(request);
        return voucherMapper.toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse updateVoucher(Long id, VoucherRequest request) {
        if (request.getType() == com.example.shop.domain.enums.VoucherType.PERCENT && request.getValue() > 100) {
            throw new AppException(ErrorCode.INVALID_VOUCHER_VALUE);
        }
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));
        
        // Manual mapping to update existing entity
        voucher.setCode(request.getCode());
        voucher.setType(request.getType());
        voucher.setValue(request.getValue());
        voucher.setMaxDiscount(request.getMaxDiscount());
        voucher.setMinOrderValue(request.getMinOrderValue());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());
        voucher.setUsageLimit(request.getUsageLimit());
        voucher.setUsagePerUser(request.getUsagePerUser());
        voucher.setStatus(request.getStatus());

        return voucherMapper.toResponse(voucherRepository.save(voucher));
    }

    @Transactional(readOnly = true)
    public Page<VoucherResponse> getAllVouchers(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return voucherRepository.findByCodeContainingIgnoreCase(keyword.trim(), pageable)
                    .map(voucherMapper::toResponse);
        }
        return voucherRepository.findAll(pageable).map(voucherMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .map(voucherMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));
    }

    @Transactional
    public void deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));
        voucherRepository.delete(voucher);
    }

    public Voucher validateVoucher(String code, Long userId, Double orderValue) {
        Voucher voucher = voucherRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.VOUCHER_NOT_FOUND));

        if (voucher.getStatus() != VoucherStatus.ACTIVE) {
            throw new AppException(ErrorCode.VOUCHER_INACTIVE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            throw new AppException(ErrorCode.VOUCHER_NOT_STARTED);
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            throw new AppException(ErrorCode.VOUCHER_EXPIRED);
        }

        if (voucher.getMinOrderValue() != null && orderValue < voucher.getMinOrderValue()) {
            throw new AppException(ErrorCode.VOUCHER_MIN_ORDER_VALUE);
        }

        if (voucher.getUsageLimit() != null) {
            long totalUsed = voucherUsageRepository.countByVoucher(voucher);
            if (totalUsed >= voucher.getUsageLimit()) {
                throw new AppException(ErrorCode.VOUCHER_LIMIT_EXCEEDED);
            }
        }

        if (userId != null && voucher.getUsagePerUser() != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            long userUsed = voucherUsageRepository.countByVoucherAndUser(voucher, user);
            if (userUsed >= voucher.getUsagePerUser()) {
                throw new AppException(ErrorCode.VOUCHER_USER_LIMIT_EXCEEDED);
            }
        }

        return voucher;
    }

    public Double calculateDiscount(Voucher voucher, Double orderValue) {
        Double discount = 0.0;
        switch (voucher.getType()) {
            case PERCENT -> {
                discount = orderValue * (voucher.getValue() / 100.0);
                if (voucher.getMaxDiscount() != null && discount > voucher.getMaxDiscount()) {
                    discount = voucher.getMaxDiscount();
                }
            }
            case FIXED -> {
                discount = voucher.getValue();
            }
        }
        return Math.min(discount, orderValue);
    }
}
