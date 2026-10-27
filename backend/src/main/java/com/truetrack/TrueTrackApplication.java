package com.truetrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * Entry point of the True Track backend.
 *
 * UserDetailsServiceAutoConfiguration is excluded because we do not want Spring's
 * default in-memory user with a generated password - our users live in PostgreSQL
 * and log in with JWT tokens.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class TrueTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(TrueTrackApplication.class, args);
    }
}
