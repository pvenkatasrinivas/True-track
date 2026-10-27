package com.truetrack.service;

import com.truetrack.dto.AuthResponse;
import com.truetrack.dto.LoginRequest;
import com.truetrack.dto.RegisterRequest;
import com.truetrack.dto.UserResponse;
import com.truetrack.entity.User;
import com.truetrack.exception.DuplicateResourceException;
import com.truetrack.exception.InvalidCredentialsException;
import com.truetrack.exception.ResourceNotFoundException;
import com.truetrack.repository.UserRepository;
import com.truetrack.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Registration and login. */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already registered");
        }
        // Never store the plain password - only the BCrypt hash.
        User user = new User(request.getName().trim(), email, passwordEncoder.encode(request.getPassword()));
        User saved = userRepository.save(user);
        return new AuthResponse(jwtUtil.generateToken(saved.getEmail()), UserResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email).orElse(null);

        // Same message for "no such user" and "wrong password", so attackers can't learn which emails exist.
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
