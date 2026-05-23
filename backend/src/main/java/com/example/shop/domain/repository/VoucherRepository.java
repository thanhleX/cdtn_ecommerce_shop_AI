package com.example.shop.domain.repository;

import com.example.shop.domain.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);
    
    Page<Voucher> findByCodeContainingIgnoreCase(String keyword, Pageable pageable);
}
