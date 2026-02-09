package com.omkar.uni.verse.domain.dto.events.bookings;

import java.time.LocalDateTime;

public record BatchLockResult(
        boolean success,
        String message,
        LocalDateTime lockExpiresAt,
        int seatsLocked
) {

    public static BatchLockResult success(LocalDateTime lockExpiresAt, int count) {
        return new BatchLockResult(true, "All seats locked", lockExpiresAt, count);
    }

    public static BatchLockResult failure(String message) {
        return new BatchLockResult(false, message, null, 0);
    }
}
