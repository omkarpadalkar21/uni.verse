# Error Handling Documentation

## Overview
This document describes the comprehensive error handling system implemented in the uni.verse backend application.

## Components

### 1. Custom Exception Classes (`/exception` package)

#### ResourceNotFoundException
- **Purpose**: Thrown when a requested resource is not found
- **HTTP Status**: 404 NOT FOUND
- **Error Code**: RESOURCE-001
- **Usage Example**:
```java
throw new ResourceNotFoundException("Event", "id", eventId);
throw new ResourceNotFoundException("User not found");
```

#### InvalidRequestException
- **Purpose**: Thrown when a request contains invalid data or violates business rules
- **HTTP Status**: 400 BAD REQUEST
- **Error Code**: VALIDATION-001 (or custom)
- **Usage Example**:
```java
throw new InvalidRequestException("Only MUJ email addresses are allowed");
throw new InvalidRequestException("Invalid data", "CUSTOM-001");
```

#### SeatLockException
- **Purpose**: Thrown when seat locking operations fail
- **HTTP Status**: 409 CONFLICT
- **Error Code**: SEAT-001
- **Usage Example**:
```java
throw new SeatLockException(seatId, "Seat is already locked");
throw new SeatLockException("Failed to acquire lock");
```

#### RateLimitExceededException
- **Purpose**: Thrown when rate limit is exceeded
- **HTTP Status**: 429 TOO MANY REQUESTS
- **Error Code**: RATE-001
- **Usage Example**:
```java
throw new RateLimitExceededException("Too many requests", retryAfterSeconds);
```

#### TokenException
- **Purpose**: Thrown for token-related errors (OTP, reset tokens, etc.)
- **HTTP Status**: 400 BAD REQUEST
- **Error Codes**: TOKEN-001 (expired), TOKEN-002 (invalid), TOKEN-003 (already used), TOKEN-004 (not found)
- **Usage Example**:
```java
throw new TokenException("OTP has expired", TokenException.TokenErrorType.EXPIRED);
throw new TokenException("Invalid OTP", TokenException.TokenErrorType.INVALID);
```

### 2. ErrorResponseDto

Enhanced DTO for error responses with the following fields:
- `message`: Human-readable error message
- `code`: Error code for client-side handling
- `timestamp`: When the error occurred
- `status`: HTTP status code
- `path`: Request path where error occurred
- `details`: Additional error details (e.g., validation errors)

**Example Response**:
```json
{
  "message": "Validation failed for one or more fields",
  "code": "VALIDATION-002",
  "timestamp": "2026-02-11T21:30:00",
  "status": 400,
  "path": "/api/events",
  "details": {
    "name": "must not be blank",
    "date": "must be a future date"
  }
}
```

### 3. GlobalExceptionHandler

Centralized exception handling for the entire application. Handles:

#### JWT & Authentication Exceptions
- `ExpiredJwtException` → JWT-001
- `MalformedJwtException`, `SignatureException` → JWT-002
- `JwtException` → JWT-003
- `BadCredentialsException` → AUTH-002
- `UsernameNotFoundException` → AUTH-001
- `DisabledException` → AUTH-003
- `LockedException` → AUTH-004
- `AuthenticationException` → AUTH-005
- `AccessDeniedException` → AUTH-006

#### Custom Application Exceptions
- `ResourceNotFoundException` → RESOURCE-001
- `EntityNotFoundException` → RESOURCE-002
- `InvalidRequestException` → VALIDATION-001
- `SeatLockException` → SEAT-001
- `RateLimitExceededException` → RATE-001
- `TokenException` → TOKEN-001/002/003/004

#### Validation Exceptions
- `MethodArgumentNotValidException` → VALIDATION-002
- `ConstraintViolationException` → VALIDATION-003
- `IllegalArgumentException` → VALIDATION-004
- `IllegalStateException` → STATE-001

#### HTTP & Request Exceptions
- `HttpMessageNotReadableException` → HTTP-001
- `HttpRequestMethodNotSupportedException` → HTTP-002
- `HttpMediaTypeNotSupportedException` → HTTP-003
- `MissingServletRequestParameterException` → HTTP-004
- `MethodArgumentTypeMismatchException` → HTTP-005
- `NoHandlerFoundException` → HTTP-006
- `MaxUploadSizeExceededException` → HTTP-007

#### Database Exceptions
- `DataIntegrityViolationException` → DB-001

#### Generic Exceptions
- `Exception` → INTERNAL-001
- `RuntimeException` → RUNTIME-001

## Error Code Categories

| Prefix | Category | Description |
|--------|----------|-------------|
| JWT-xxx | JWT Errors | Token validation and authentication |
| AUTH-xxx | Authentication | User authentication and authorization |
| RESOURCE-xxx | Resources | Resource not found errors |
| VALIDATION-xxx | Validation | Input validation errors |
| STATE-xxx | State | Invalid operation state |
| SEAT-xxx | Seat Booking | Seat locking and booking errors |
| RATE-xxx | Rate Limiting | Rate limit exceeded |
| TOKEN-xxx | Tokens | OTP and reset token errors |
| HTTP-xxx | HTTP | HTTP protocol errors |
| DB-xxx | Database | Database constraint violations |
| INTERNAL-xxx | Internal | Unexpected server errors |
| RUNTIME-xxx | Runtime | Runtime errors |

## Migration Guide

### Replacing Existing Exceptions

**Before**:
```java
throw new IllegalArgumentException("OTP has expired. Request a new one.");
```

**After**:
```java
throw new TokenException("OTP has expired. Request a new one.", TokenException.TokenErrorType.EXPIRED);
```

**Before**:
```java
throw new EntityNotFoundException("Seat not found: " + seatId);
```

**After**:
```java
throw new ResourceNotFoundException("Seat", "id", seatId);
```

**Before**:
```java
throw new IllegalStateException("Could not acquire lock for seat confirmation");
```

**After**:
```java
throw new SeatLockException(seatId, "Could not acquire lock for confirmation");
```

## Benefits

1. **Consistent Error Responses**: All errors follow the same structure
2. **Better Client Handling**: Error codes allow clients to handle specific errors programmatically
3. **Improved Debugging**: Path and timestamp information help with troubleshooting
4. **Detailed Validation Errors**: Field-level validation errors are clearly communicated
5. **Security**: Sensitive information is not leaked in error messages
6. **Logging**: All errors are properly logged with appropriate levels
7. **HTTP Standards**: Correct HTTP status codes are used for different error types

## Best Practices

1. **Use specific exceptions**: Use custom exceptions instead of generic ones when possible
2. **Provide context**: Include relevant information (IDs, field names) in error messages
3. **Don't expose internals**: Keep error messages user-friendly, don't expose stack traces or internal details
4. **Log appropriately**: Use `warn` for expected errors, `error` for unexpected ones
5. **Be consistent**: Use the same error codes for the same types of errors across the application
