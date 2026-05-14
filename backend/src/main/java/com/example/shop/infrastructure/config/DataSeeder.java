package com.example.shop.infrastructure.config;

import com.example.shop.domain.entity.Role;
import com.example.shop.domain.entity.User;
import com.example.shop.domain.repository.RoleRepository;
import com.example.shop.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import com.example.shop.domain.entity.Permission;
import com.example.shop.domain.repository.PermissionRepository;
import java.util.HashSet;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking for Admin initialization...");

        if (!userRepository.existsByUsername("admin")) {
            log.info("Admin not found. Creating a new one...");

            // Get all current permissions in the system
            List<Permission> allPermissions = permissionRepository.findAll();
            
            if (allPermissions.isEmpty()) {
                log.warn("No permissions found in DB. Please ensure your migration scripts ran successfully.");
                return;
            }

            // Create or update ADMIN role with all permissions
            Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
                Role role = new Role();
                role.setName("ADMIN");
                return role;
            });
            
            adminRole.setPermissions(new HashSet<>(allPermissions));
            roleRepository.save(adminRole);

            // Assign ADMIN role to admin user
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            User admin = User.builder()
                    .username("admin")
                    .fullName("System Owner")
                    .email("admin@viettechstore.system")
                    .password(passwordEncoder.encode("admin"))
                    .roles(roles)
                    .isActive(true)
                    .build();

            userRepository.save(admin);
            log.info("Admin has been created successfully (username: admin, password: admin).");
        } else {
            Role adminRole = roleRepository.findByName("ADMIN").orElse(null);

            if (adminRole != null) {
                List<Permission> allPermissions = permissionRepository.findAll();

                Set<Permission> currentPermissions = adminRole.getPermissions();
                Set<Permission> newPermissions = new HashSet<>(currentPermissions);

                for (Permission p : allPermissions) {
                    if (!currentPermissions.contains(p)) {
                        newPermissions.add(p);
                    }
                }

                // chỉ save nếu có thay đổi
                if (newPermissions.size() != currentPermissions.size()) {
                    adminRole.setPermissions(newPermissions);
                    roleRepository.save(adminRole);
                    log.info("Added missing permissions to ADMIN.");
                } else {
                    log.info("ADMIN permissions already up to date.");
                }
            }
        }
    }
}
