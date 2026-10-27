package com.truetrack.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;
import java.time.Instant;

/**
 * A person who can log in. Hibernate maps this class to the "users" table.
 * ("user" is a reserved word in PostgreSQL, so the table is called "users".)
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    /** Saved in lower case so "Ravi@Mail.com" and "ravi@mail.com" are the same account. */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** BCrypt hash of the password - the plain password is never stored. */
    @Column(nullable = false, length = 100)
    private String password;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public User() {
    }

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    /** Runs automatically just before the row is inserted. */
    @PrePersist
    public void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
