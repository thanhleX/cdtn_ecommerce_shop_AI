package com.example.shop.application.service;

import com.example.shop.application.dto.request.RoleRequest;
import com.example.shop.application.dto.response.RoleResponse;
import com.example.shop.domain.entity.Permission;
import com.example.shop.domain.entity.Role;
import com.example.shop.domain.exception.AppException;
import com.example.shop.domain.exception.ErrorCode;
import com.example.shop.domain.repository.PermissionRepository;
import com.example.shop.domain.repository.RoleRepository;
import com.example.shop.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "rolePermissions", allEntries = true)
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.ROLE_ALREADY_EXISTS);
        }

        Role role = new Role();
        String roleName = request.getName().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }
        role.setName(roleName);
        role.setPermissions(getPermissionsFromNames(request.getPermissions()));

        return toResponse(roleRepository.save(role));
    }

    @Transactional
    @CacheEvict(value = "rolePermissions", allEntries = true)
    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION)); // ROLE_NOT_FOUND

        if (role.getName().contains("ADMIN")) {
            throw new AppException(ErrorCode.CANNOT_MODIFY_ADMIN);
        }

        String roleName = request.getName().toUpperCase();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }
        role.setName(roleName);
        role.setPermissions(getPermissionsFromNames(request.getPermissions()));

        return toResponse(roleRepository.save(role));
    }

    @Transactional
    @CacheEvict(value = "rolePermissions", allEntries = true)
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION));

        String name = role.getName();
        if (name.contains("ADMIN") || name.contains("CUSTOMER")) {
            throw new AppException(ErrorCode.CANNOT_DELETE_SYSTEM_ROLE);
        }

        // Check if role is assigned to users
        long usersCount = userRepository.countByRoles_Id(id);
        if (usersCount > 0) {
            throw new AppException(ErrorCode.ROLE_IN_USE);
        }
        
        // delete
        roleRepository.delete(role);
    }

    private Set<Permission> getPermissionsFromNames(Set<String> names) {
        if (names == null || names.isEmpty()) return new HashSet<>();
        List<Permission> permissions = permissionRepository.findByNameIn(names);
        return new HashSet<>(permissions);
    }

    private RoleResponse toResponse(Role role) {
        String name = role.getName();
        if (name != null && !name.startsWith("ROLE_")) {
            name = "ROLE_" + name;
        }
        return RoleResponse.builder()
                .id(role.getId())
                .name(name)
                .permissions(role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.toSet()))
                .build();
    }
}
