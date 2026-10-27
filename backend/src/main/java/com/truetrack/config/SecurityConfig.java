package com.truetrack.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.truetrack.exception.ErrorResponse;
import com.truetrack.repository.UserRepository;
import com.truetrack.security.JwtAuthFilter;
import com.truetrack.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Security rules:
 * - /api/auth/register and /api/auth/login are open to everyone.
 * - Every other /api/** call needs a valid JWT token.
 * - No server sessions (STATELESS): the token is checked on every request.
 */
@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtUtil jwtUtil, UserRepository userRepository, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF protection is for cookie-based sessions; we use tokens in a header instead.
                .csrf().disable()
                .cors().and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler()).and()
                .authorizeRequests()
                    .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .antMatchers("/api/auth/register", "/api/auth/login").permitAll()
                    .antMatchers("/error").permitAll()
                    .anyRequest().authenticated()
                .and()
                .httpBasic().disable()
                .formLogin().disable()
                .addFilterBefore(new JwtAuthFilter(jwtUtil, userRepository), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** BCrypt hashes passwords with a random salt; the same password gives a different hash each time. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Returns a JSON 401 error when the user is not logged in or the token is invalid/expired. */
    private AuthenticationEntryPoint unauthorizedHandler() {
        return (request, response, authException) -> {
            boolean expired = request.getAttribute(JwtAuthFilter.EXPIRED_ATTRIBUTE) != null;
            String message = expired
                    ? "Your session has expired. Please log in again."
                    : "You must be logged in to access this resource";
            ErrorResponse body = new ErrorResponse(HttpStatus.UNAUTHORIZED, message, request.getRequestURI(), null);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            objectMapper.writeValue(response.getOutputStream(), body);
        };
    }

    /** Allows the React app (running on another port/domain) to call this API from the browser. */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = new ArrayList<String>();
        for (String origin : allowedOrigins.split(",")) {
            if (!origin.trim().isEmpty()) {
                origins.add(origin.trim());
            }
        }
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
