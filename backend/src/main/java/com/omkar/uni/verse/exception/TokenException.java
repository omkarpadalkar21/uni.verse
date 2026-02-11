package com.omkar.uni.verse.exception;

/**
 * Exception thrown for token-related errors (OTP, reset tokens, etc.)
 */
public class TokenException extends RuntimeException {
    
    private final TokenErrorType errorType;

    public enum TokenErrorType {
        EXPIRED,
        INVALID,
        ALREADY_USED,
        NOT_FOUND
    }

    public TokenException(String message, TokenErrorType errorType) {
        super(message);
        this.errorType = errorType;
    }

    public TokenErrorType getErrorType() {
        return errorType;
    }
}
