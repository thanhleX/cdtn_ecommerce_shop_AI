package com.example.shop.domain.repository;

import com.example.shop.domain.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByEmailAndOtpCodeAndIsUsedFalse(String email, String otpCode);
    void deleteByEmail(String email);
}
