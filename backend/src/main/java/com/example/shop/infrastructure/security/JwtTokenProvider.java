package com.example.shop.infrastructure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    /** Access Token: 15 phút (900_000 ms) */
    @Value("${app.jwt.expiration}")
    private long jwtExpirationInMs;

    /** Refresh Token: 7 ngày (604_800_000 ms) */
    @Value("${app.jwt.refresh-expiration}")
    private long jwtRefreshExpirationInMs;

    private SecretKey key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        Long id = userDetails.getId();
        
        java.util.List<String> roles = new java.util.ArrayList<>();
        
        authentication.getAuthorities().forEach(authority -> {
            String auth = authority.getAuthority();
            if (auth.startsWith("ROLE_")) {
                roles.add(auth.substring(5));
            }
        });
        
        return buildToken(username, id, roles, jwtExpirationInMs);
    }

    public String generateTokenFromUser(com.example.shop.domain.entity.User user) {
        java.util.List<String> roles = new java.util.ArrayList<>();
        
        if (user.getRoles() != null) {
            user.getRoles().forEach(role -> {
                String roleName = role.getName();
                if (roleName != null && roleName.startsWith("ROLE_")) {
                    roles.add(roleName.substring(5));
                } else {
                    roles.add(roleName);
                }
            });
        }
        return buildToken(user.getUsername(), user.getId(), roles, jwtExpirationInMs);
    }

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtRefreshExpirationInMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("typ", "refresh")
                .setId(UUID.randomUUID().toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        return parseClaims(token).getSubject();
    }

    public Long getUserIdFromJWT(String token) {
        return parseClaims(token).get("id", Long.class);
    }

    @SuppressWarnings("unchecked")
    public java.util.List<String> getRolesFromJWT(String token) {
        return parseClaims(token).get("roles", java.util.List.class);
    }


    public LocalDateTime getExpirationFromJWT(String token) {
        Date expiration = parseClaims(token).getExpiration();
        return expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
    }

    public boolean validateToken(String authToken) {
        Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
        return true;
    }

    private String buildToken(String username, Long id, java.util.List<String> roles, 
                             long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
