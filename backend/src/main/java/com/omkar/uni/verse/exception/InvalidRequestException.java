package com.omkar.uni.verse.exception;

/**
 * Exception thrown when a request contains invalid data or violates business rules
 */
public class InvalidRequestException extends RuntimeException {
    
    private final String errorCode;

    public InvalidRequestException(String message) {
        super(message);
        this.errorCode = null;
    }

    public InvalidRequestException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public InvalidRequestException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = null;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
