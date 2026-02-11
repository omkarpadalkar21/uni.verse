package com.omkar.uni.verse.exception;

/**
 * Exception thrown when seat locking operations fail
 */
public class SeatLockException extends RuntimeException {
    
    private final Long seatId;
    private final String reason;

    public SeatLockException(String message) {
        super(message);
        this.seatId = null;
        this.reason = null;
    }

    public SeatLockException(Long seatId, String reason) {
        super(String.format("Seat lock failed for seat %d: %s", seatId, reason));
        this.seatId = seatId;
        this.reason = reason;
    }

    public SeatLockException(String message, Throwable cause) {
        super(message, cause);
        this.seatId = null;
        this.reason = null;
    }

    public Long getSeatId() {
        return seatId;
    }

    public String getReason() {
        return reason;
    }
}
