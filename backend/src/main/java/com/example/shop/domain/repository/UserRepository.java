package com.example.shop.domain.repository;

import com.example.shop.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByRoles_Name(String roleName);
    List<User> findByRoles_NameIn(List<String> roleName);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    long countByRoles_Name(String roleName);
    long countByRoles_Id(Long roleId);
    Page<User> findByUsernameNot(String username, Pageable pageable);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.roles r WHERE " +
           "u.username != 'admin' AND (" +
           ":keyword IS NULL OR :keyword = '' OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchUsersExcludingAdmin(@Param("keyword") String keyword, Pageable pageable);
}
