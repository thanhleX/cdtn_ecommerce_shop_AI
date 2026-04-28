package com.example.shop.application.service;

import com.example.shop.domain.entity.Permission;
import com.example.shop.domain.entity.Role;
import com.example.shop.domain.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolePermissionCacheService {

    private final RoleRepository roleRepository;

    @Cacheable(value = "rolePermissions", key = "#roles.toString()")
    @Transactional(readOnly = true)
    public List<String> getPermissionsForRoles(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }

        Set<String> permissions = new HashSet<>();
        for (String roleName : roles) {
            roleRepository.findByName(roleName).ifPresentOrElse(role -> {
                if (role.getPermissions() != null) {
                    role.getPermissions().forEach(p -> permissions.add(p.getName()));
                }
            }, () -> {
                String dbRoleName = roleName.startsWith("ROLE_") ? roleName.substring(5) : "ROLE_" + roleName;
                roleRepository.findByName(dbRoleName).ifPresent(role -> {
                    if (role.getPermissions() != null) {
                        role.getPermissions().forEach(p -> permissions.add(p.getName()));
                    }
                });
            });
        }
        
        return permissions.stream().toList();
    }
}
