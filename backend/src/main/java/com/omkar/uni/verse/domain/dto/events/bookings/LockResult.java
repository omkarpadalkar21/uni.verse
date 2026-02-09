package com.omkar.uni.verse.domain.dto.events.bookings;

import java.time.LocalDateTime;

public record LockResult(
        Boolean     success,
        String message,
        LocalDateTime lockExpiresAt
) {
    public static LockResult success(LocalDateTime expiresAt) {
        return new LockResult(true, "Seat locked successfully", expiresAt);
    }

    public static LockResult failure(String message) {
        return new LockResult(false, message, null);
    }
}
