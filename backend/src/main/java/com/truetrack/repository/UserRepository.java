package com.truetrack.repository;

import com.truetrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA creates the implementation of this interface at runtime.
 * findByEmail / existsByEmail are "derived queries": Spring builds the SQL from the method name.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
