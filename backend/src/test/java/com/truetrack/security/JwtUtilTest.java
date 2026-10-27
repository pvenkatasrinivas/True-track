package com.truetrack.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Plain unit tests for JwtUtil (no Spring context needed). */
class JwtUtilTest {

    private static final String SECRET = "test-only-secret-key-for-junit-0123456789abcdef";

    @Test
    void generatedTokenContainsTheEmail() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 24);

        String token = jwtUtil.generateToken("ravi@example.com");

        assertThat(jwtUtil.extractEmail(token)).isEqualTo("ravi@example.com");
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        JwtUtil ours = new JwtUtil(SECRET, 24);
        JwtUtil attacker = new JwtUtil("a-completely-different-secret-key-9876543210", 24);

        String forged = attacker.generateToken("ravi@example.com");

        assertThatThrownBy(() -> ours.extractEmail(forged)).isInstanceOf(JwtException.class);
    }

    @Test
    void expiredTokenIsRejected() {
        // Negative expiry -> the token is already expired when it is created
        JwtUtil jwtUtil = new JwtUtil(SECRET, -1);

        String token = jwtUtil.generateToken("ravi@example.com");

        assertThatThrownBy(() -> jwtUtil.extractEmail(token)).isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void shortSecretIsNotAllowed() {
        assertThatThrownBy(() -> new JwtUtil("too-short", 24)).isInstanceOf(IllegalStateException.class);
    }
}
