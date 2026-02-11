package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.ErrorResponseDto;
import com.omkar.uni.verse.exception.*;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.security.SignatureException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for the entire application.
 * Handles all exceptions and returns appropriate error responses with proper HTTP status codes.
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ==================== JWT & Authentication Exceptions ====================

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<ErrorResponseDto> handleExpiredJwt(ExpiredJwtException e, HttpServletRequest request) {
        log.warn("JWT expired: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Your session has expired. Please login again.",
                "JWT-001",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler({MalformedJwtException.class, SignatureException.class})
    public ResponseEntity<ErrorResponseDto> handleInvalidJwt(Exception e, HttpServletRequest request) {
        log.warn("Invalid JWT: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Invalid authentication token. Please login again.",
                "JWT-002",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponseDto> handleJwtException(JwtException e, HttpServletRequest request) {
        log.warn("JWT error: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Token validation failed. Please login again.",
                "JWT-003",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDto> handleBadCredentials(BadCredentialsException e, HttpServletRequest request) {
        log.warn("Bad credentials: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Invalid email or password",
                "AUTH-002",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleUserNotFound(UsernameNotFoundException e, HttpServletRequest request) {
        log.warn("User not found: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "User not found",
                "AUTH-001",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ErrorResponseDto> handleDisabledAccount(DisabledException e, HttpServletRequest request) {
        log.warn("Disabled account access attempt: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Your account has been disabled. Please contact support.",
                "AUTH-003",
                HttpStatus.FORBIDDEN.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorResponseDto> handleLockedAccount(LockedException e, HttpServletRequest request) {
        log.warn("Locked account access attempt: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Your account has been locked. Please contact support.",
                "AUTH-004",
                HttpStatus.FORBIDDEN.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponseDto> handleAuthenticationException(AuthenticationException e, HttpServletRequest request) {
        log.warn("Authentication failed: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Authentication failed: " + e.getMessage(),
                "AUTH-005",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {
        log.warn("Access denied: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage() != null ? e.getMessage() : "You don't have permission to access this resource",
                "AUTH-006",
                HttpStatus.FORBIDDEN.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // ==================== Custom Application Exceptions ====================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleResourceNotFound(ResourceNotFoundException e, HttpServletRequest request) {
        log.warn("Resource not found: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage(),
                "RESOURCE-001",
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleEntityNotFound(EntityNotFoundException e, HttpServletRequest request) {
        log.warn("Entity not found: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage() != null ? e.getMessage() : "Requested resource not found",
                "RESOURCE-002",
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponseDto> handleInvalidRequest(InvalidRequestException e, HttpServletRequest request) {
        log.warn("Invalid request: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage(),
                e.getErrorCode() != null ? e.getErrorCode() : "VALIDATION-001",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(SeatLockException.class)
    public ResponseEntity<ErrorResponseDto> handleSeatLockException(SeatLockException e, HttpServletRequest request) {
        log.warn("Seat lock error: {}", e.getMessage());
        Map<String, String> details = new HashMap<>();
        if (e.getSeatId() != null) {
            details.put("seatId", e.getSeatId().toString());
        }
        if (e.getReason() != null) {
            details.put("reason", e.getReason());
        }
        
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage(),
                "SEAT-001",
                HttpStatus.CONFLICT.value(),
                request.getRequestURI(),
                details.isEmpty() ? null : details
        );
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleRateLimitExceeded(RateLimitExceededException e, HttpServletRequest request) {
        log.warn("Rate limit exceeded: {}", e.getMessage());
        Map<String, String> details = new HashMap<>();
        details.put("retryAfterSeconds", String.valueOf(e.getRetryAfterSeconds()));
        
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage(),
                "RATE-001",
                HttpStatus.TOO_MANY_REQUESTS.value(),
                request.getRequestURI(),
                details
        );
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(e.getRetryAfterSeconds()))
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(TokenException.class)
    public ResponseEntity<ErrorResponseDto> handleTokenException(TokenException e, HttpServletRequest request) {
        log.warn("Token error: {}", e.getMessage());
        String code = switch (e.getErrorType()) {
            case EXPIRED -> "TOKEN-001";
            case INVALID -> "TOKEN-002";
            case ALREADY_USED -> "TOKEN-003";
            case NOT_FOUND -> "TOKEN-004";
        };
        
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage(),
                code,
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // ==================== Validation Exceptions ====================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidationErrors(MethodArgumentNotValidException e, HttpServletRequest request) {
        log.warn("Validation error: {}", e.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponseDto error = new ErrorResponseDto(
                "Validation failed for one or more fields",
                "VALIDATION-002",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI(),
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponseDto> handleConstraintViolation(ConstraintViolationException e, HttpServletRequest request) {
        log.warn("Constraint violation: {}", e.getMessage());
        
        Map<String, String> errors = e.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                ));

        ErrorResponseDto error = new ErrorResponseDto(
                "Constraint violation",
                "VALIDATION-003",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI(),
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalArgument(IllegalArgumentException e, HttpServletRequest request) {
        log.warn("Illegal argument: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage() != null ? e.getMessage() : "Invalid request parameters",
                "VALIDATION-004",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponseDto> handleIllegalState(IllegalStateException e, HttpServletRequest request) {
        log.warn("Illegal state: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                e.getMessage() != null ? e.getMessage() : "Invalid operation state",
                "STATE-001",
                HttpStatus.CONFLICT.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // ==================== HTTP & Request Exceptions ====================

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponseDto> handleHttpMessageNotReadable(HttpMessageNotReadableException e, HttpServletRequest request) {
        log.warn("Malformed JSON request: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Malformed JSON request. Please check your request body.",
                "HTTP-001",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponseDto> handleMethodNotSupported(HttpRequestMethodNotSupportedException e, HttpServletRequest request) {
        log.warn("Method not supported: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "HTTP method '" + e.getMethod() + "' is not supported for this endpoint",
                "HTTP-002",
                HttpStatus.METHOD_NOT_ALLOWED.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponseDto> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException e, HttpServletRequest request) {
        log.warn("Media type not supported: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Media type '" + e.getContentType() + "' is not supported",
                "HTTP-003",
                HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponseDto> handleMissingParameter(MissingServletRequestParameterException e, HttpServletRequest request) {
        log.warn("Missing request parameter: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "Required parameter '" + e.getParameterName() + "' is missing",
                "HTTP-004",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponseDto> handleTypeMismatch(MethodArgumentTypeMismatchException e, HttpServletRequest request) {
        log.warn("Type mismatch: {}", e.getMessage());
        String message = String.format("Parameter '%s' should be of type %s",
                e.getName(),
                e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "unknown");
        
        ErrorResponseDto error = new ErrorResponseDto(
                message,
                "HTTP-005",
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNoHandlerFound(NoHandlerFoundException e, HttpServletRequest request) {
        log.warn("No handler found: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "The requested endpoint does not exist",
                "HTTP-006",
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e, HttpServletRequest request) {
        log.warn("File upload size exceeded: {}", e.getMessage());
        ErrorResponseDto error = new ErrorResponseDto(
                "File size exceeds the maximum allowed limit",
                "HTTP-007",
                HttpStatus.PAYLOAD_TOO_LARGE.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // ==================== Database Exceptions ====================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDto> handleDataIntegrityViolation(DataIntegrityViolationException e, HttpServletRequest request) {
        log.error("Data integrity violation: {}", e.getMessage());
        
        String message = "Database constraint violation";
        if (e.getMessage() != null) {
            if (e.getMessage().contains("Duplicate entry")) {
                message = "A record with this information already exists";
            } else if (e.getMessage().contains("foreign key constraint")) {
                message = "Cannot perform this operation due to related records";
            }
        }
        
        ErrorResponseDto error = new ErrorResponseDto(
                message,
                "DB-001",
                HttpStatus.CONFLICT.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    // ==================== Generic Exception Handler ====================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception e, HttpServletRequest request) {
        log.error("Unexpected error occurred: ", e);
        ErrorResponseDto error = new ErrorResponseDto(
                "An unexpected error occurred. Please try again later.",
                "INTERNAL-001",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDto> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        log.error("Runtime error occurred: ", e);
        ErrorResponseDto error = new ErrorResponseDto(
                "A runtime error occurred: " + e.getMessage(),
                "RUNTIME-001",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body(error);
    }
}


