package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.events.BookingSeatId;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SeatLockResponse {
    private BookingSeatId id;
    private List<SeatDTO> lockedSeats;
    private LocalDateTime expiresAt;
    private BigDecimal totalAmount;
}
