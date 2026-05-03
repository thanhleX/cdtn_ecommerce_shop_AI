package com.example.shop.domain.repository;

import com.example.shop.domain.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByNameIn(Collection<String> names);
}
