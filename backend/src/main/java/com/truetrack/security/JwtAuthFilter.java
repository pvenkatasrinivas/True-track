package com.truetrack.security;

import com.truetrack.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

/**
 * Runs once for every request.
 * If the request has "Authorization: Bearer <token>" and the token is valid,
 * the user is marked as logged in for this request.
 *
 * Note: this class is created in SecurityConfig with "new" (it is not a @Component),
 * so Spring Boot does not also register it a second time as a normal servlet filter.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    /** Set when the token is expired, so the 401 response can say "session expired". */
    public static final String EXPIRED_ATTRIBUTE = "jwtExpired";

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String email = jwtUtil.extractEmail(token);
                // Only accept tokens of users that still exist
                if (email != null && userRepository.existsByEmail(email)) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            email, null, Collections.<GrantedAuthority>emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (ExpiredJwtException e) {
                request.setAttribute(EXPIRED_ATTRIBUTE, Boolean.TRUE);
            } catch (JwtException | IllegalArgumentException e) {
                // Invalid token: leave the request unauthenticated -> Spring Security returns 401
            }
        }

        chain.doFilter(request, response);
    }
}
