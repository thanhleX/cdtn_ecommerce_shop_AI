package com.example.shop.application.service;

import com.example.shop.application.dto.request.UpdateProfileRequest;
import com.example.shop.application.dto.request.CreateStaffRequest;
import com.example.shop.application.dto.response.UserResponse;
import com.example.shop.application.mapper.UserMapper;
import com.example.shop.domain.entity.Role;
import com.example.shop.domain.entity.User;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.RoleRepository;
import com.example.shop.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Format is changing email and checking if it already belongs to another user
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE_EMAIL);
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        User updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String keyword, String roleName, Pageable pageable) {
        return userRepository.searchUsersExcludingAdmin(keyword, roleName, pageable).map(userMapper::toUserResponse);
    }

    @Transactional
    public UserResponse toggleActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        if ("admin".equals(user.getUsername())) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Hoặc tạo ErrorCode riêng cho Restricted Access
        }

        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if ("admin".equals(user.getUsername())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<Role> rolesList = roleRepository.findAllById(roleIds);
        user.setRoles(new HashSet<>(rolesList));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse resetPassword(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if ("admin".equals(user.getUsername())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Default password: Staff@123
        user.setPassword(passwordEncoder.encode("Staff@123"));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse createStaff(CreateStaffRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.DUPLICATE_USERNAME);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE_EMAIL);
        }

        List<Role> rolesList = roleRepository.findAllById(request.getRoleIds());
        
        User user = User.builder()
                .username(request.getUsername())
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(new HashSet<>(rolesList))
                .isActive(true)
                .build();

        return userMapper.toUserResponse(userRepository.save(user));
    }
}
