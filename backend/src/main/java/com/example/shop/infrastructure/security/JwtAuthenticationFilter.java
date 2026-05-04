package com.example.shop.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import com.example.shop.application.service.RolePermissionCacheService;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final RolePermissionCacheService rolePermissionCacheService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {

                String username = tokenProvider.getUsernameFromJWT(jwt);
                Long userId = tokenProvider.getUserIdFromJWT(jwt);
                java.util.List<String> roles = tokenProvider.getRolesFromJWT(jwt);
                java.util.List<String> permissions = rolePermissionCacheService.getPermissionsForRoles(roles);

                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();

                if (roles != null) {
                    roles.forEach(role -> authorities.add(
                            new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role)));
                }
                if (permissions != null) {
                    permissions.forEach(p -> authorities
                            .add(new org.springframework.security.core.authority.SimpleGrantedAuthority(p)));
                }

                CustomUserDetails userDetails = new CustomUserDetails(
                        userId, username, "", true, true, true, true, authorities);

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            log.error("JWT token expired: {}", ex.getMessage());
            request.setAttribute("jwt-exception", "TOKEN_EXPIRED");
        } catch (io.jsonwebtoken.security.SecurityException | io.jsonwebtoken.MalformedJwtException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
            request.setAttribute("jwt-exception", "TOKEN_INVALID");
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
            request.setAttribute("jwt-exception", "AUTH_ERROR");
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}