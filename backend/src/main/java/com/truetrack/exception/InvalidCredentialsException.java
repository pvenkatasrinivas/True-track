package com.truetrack.exception;

/** Wrong email or password at login. Becomes HTTP 401. */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
