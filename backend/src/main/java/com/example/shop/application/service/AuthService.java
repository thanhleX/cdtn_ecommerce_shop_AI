package com.example.shop.application.service;

import com.example.shop.application.dto.request.ChangePasswordRequest;
import com.example.shop.application.dto.request.GoogleLoginRequest;
import com.example.shop.application.dto.request.LinkGoogleRequest;
import com.example.shop.application.dto.request.LoginRequest;
import com.example.shop.application.dto.request.RefreshTokenRequest;
import com.example.shop.application.dto.request.RegisterRequest;
import com.example.shop.application.dto.response.AuthResponse;
import com.example.shop.domain.entity.Cart;
import com.example.shop.domain.entity.RefreshToken;
import com.example.shop.domain.entity.Role;
import com.example.shop.domain.entity.User;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.CartRepository;
import com.example.shop.domain.repository.OtpVerificationRepository;
import com.example.shop.domain.repository.RefreshTokenRepository;
import com.example.shop.domain.repository.RoleRepository;
import com.example.shop.domain.repository.UserRepository;
import com.example.shop.infrastructure.security.JwtTokenProvider;
import com.example.shop.infrastructure.utils.GoogleVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final CartRepository cartRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final GoogleVerifier googleVerifier;
    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpirationMs;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.DUPLICATE_USERNAME);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.CONFIRM_PASSWORD_NOT_MATCH);
        }

        Role userRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        java.util.Set<Role> roles = new java.util.HashSet<>();
        roles.add(userRole);

        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(roles)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Tự động tạo giỏ hàng khi đăng ký
        Cart cart = Cart.builder().user(savedUser).build();
        cartRepository.save(cart);

        // Đăng nhập tự động sau khi đăng ký
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshTokenStr = createAndSaveRefreshToken(savedUser);

        return buildAuthResponse(accessToken, refreshTokenStr, savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!user.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_DISABLED);
        }

        String accessToken = tokenProvider.generateToken(authentication);

        // Mỗi lần login: xóa refresh token cũ (nếu có) và tạo mới
        refreshTokenRepository.deleteByUserId(user.getId());
        String refreshTokenStr = createAndSaveRefreshToken(user);

        return buildAuthResponse(accessToken, refreshTokenStr, user);
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        try {
            GoogleIdToken.Payload payload = googleVerifier.verify(request.getIdToken());
            if (payload == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String googleId = payload.getSubject();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                // Đăng ký mới nếu chưa tồn tại
                Role userRole = roleRepository.findByName("CUSTOMER")
                        .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));
                
                String username = email.split("@")[0] + "_" + java.util.UUID.randomUUID().toString().substring(0, 5);

                User newUser = User.builder()
                        .username(username)
                        .fullName(name)
                        .email(email)
                        .provider("google")
                        .providerId(googleId)
                        .isActive(true)
                        .roles(java.util.Collections.singleton(userRole))
                        .build();
                
                User savedUser = userRepository.save(newUser);
                Cart cart = Cart.builder().user(savedUser).build();
                cartRepository.save(cart);
                return savedUser;
            });

            // Nếu user đã tồn tại nhưng chưa liên kết Google
            if (user.getProvider() == null || !user.getProvider().equals("google")) {
                throw new AppException(ErrorCode.ACCOUNT_LINKING_REQUIRED);
            }

            if (!user.getIsActive()) {
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }

            String accessToken = tokenProvider.generateTokenFromUser(user);
            refreshTokenRepository.deleteByUserId(user.getId());
            String refreshTokenStr = createAndSaveRefreshToken(user);

            return buildAuthResponse(accessToken, refreshTokenStr, user);

        } catch (Exception e) {
            log.error("Google login error", e);
            if (e instanceof AppException) throw (AppException) e;
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Transactional
    public AuthResponse linkGoogle(LinkGoogleRequest request) {
        try {
            GoogleIdToken.Payload payload = googleVerifier.verify(request.getIdToken());
            if (payload == null) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            String email = payload.getEmail();
            String googleId = payload.getSubject();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // Xác thực mật khẩu cũ
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new AppException(ErrorCode.INVALID_PASSWORD);
            }

            // Tiến hành link
            user.setProvider("google");
            user.setProviderId(googleId);
            userRepository.save(user);

            String accessToken = tokenProvider.generateTokenFromUser(user);
            refreshTokenRepository.deleteByUserId(user.getId());
            String refreshTokenStr = createAndSaveRefreshToken(user);

            return buildAuthResponse(accessToken, refreshTokenStr, user);

        } catch (Exception e) {
            log.error("Link google error", e);
            if (e instanceof AppException) throw (AppException) e;
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Transactional
    public AuthResponse refreshAccessToken(RefreshTokenRequest request) {
        String requestToken = request.getRefreshToken();

        // 1. Kiểm tra token có trong DB không
        RefreshToken refreshToken = refreshTokenRepository.findByToken(requestToken)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REFRESH_TOKEN));

        // 2. Kiểm tra token có hết hạn không
        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new AppException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 3. Xoay vòng Refresh Token (Rotation): Xóa cái cũ, tạo cái mới
        User user = refreshToken.getUser();
        refreshTokenRepository.delete(refreshToken);
        
        String newAccessToken = tokenProvider.generateTokenFromUser(user);
        String newRefreshTokenStr = createAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshTokenStr) // Trả về Refresh Token mới
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRoles().stream().map(Role::getName).collect(Collectors.joining(",")))
                .build();
    }

    @Transactional
    public void logout(String bearerToken) {
        if (!StringUtils.hasText(bearerToken) || !bearerToken.startsWith("Bearer "))
            throw new AppException(ErrorCode.UNAUTHORIZED);

        String accessToken = bearerToken.substring(7);

        String username = tokenProvider.getUsernameFromJWT(accessToken);

        // Xóa refresh token trong DB
        userRepository.findByUsername(username)
                .ifPresent(user -> refreshTokenRepository.deleteByUserId(user.getId()));

        log.info("User '{}' logged out successfully", username);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.CONFIRM_PASSWORD_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("User '{}' changed password successfully", user.getUsername());
    }

    @Transactional
    public void forgotPassword(com.example.shop.application.dto.request.ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Delete old OTPs for this email
        otpVerificationRepository.deleteByEmail(user.getEmail());

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        
        com.example.shop.domain.entity.OtpVerification otpVerification = com.example.shop.domain.entity.OtpVerification.builder()
                .email(user.getEmail())
                .otpCode(otp)
                .expiredAt(LocalDateTime.now().plusSeconds(60)) // 60 seconds expiry
                .isUsed(false)
                .build();
        
        otpVerificationRepository.save(otpVerification);

        // Send email
        emailService.sendOtpEmail(user.getEmail(), otp);
        
        log.info("OTP sent to email: {}", user.getEmail());
    }

    @Transactional
    public void resetPassword(com.example.shop.application.dto.request.ResetPasswordRequest request) {
        com.example.shop.domain.entity.OtpVerification otpVerification = otpVerificationRepository
                .findByEmailAndOtpCodeAndIsUsedFalse(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_OTP));

        if (otpVerification.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark OTP as used
        otpVerification.setIsUsed(true);
        otpVerificationRepository.save(otpVerification);

        log.info("Password reset successfully for email: {}", request.getEmail());
    }

    private String createAndSaveRefreshToken(User user) {
        String tokenValue = tokenProvider.generateRefreshToken(user.getUsername());
        LocalDateTime expiredAt = LocalDateTime.now()
                .plusSeconds(refreshExpirationMs / 1000);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiredAt(expiredAt)
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    private AuthResponse buildAuthResponse(String accessToken, String refreshToken, User user) {
        // Extract all roles to comma-separated string for backwards compatibility payload
        String rolesStr = user.getRoles().stream()
                .map(Role::getName)
                .collect(java.util.stream.Collectors.joining(","));
                
        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(rolesStr)
                .build();
    }
}
