package com.truetrack.exception;

/** Thrown when something already exists (e.g. an email is already registered). Becomes HTTP 409. */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
