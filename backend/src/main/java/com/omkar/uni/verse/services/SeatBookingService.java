package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.events.BookingSeatDTO;
import com.omkar.uni.verse.domain.dto.events.bookings.BatchLockResult;
import com.omkar.uni.verse.domain.dto.events.bookings.LockResult;

import java.util.List;

public interface SeatBookingService {
    LockResult lockSeat(Long seatId);

    BookingSeatDTO confirmSeatBooking(Long seatId);

    void releaseLockSeat(Long seatId);

    BatchLockResult lockMultipleSeats(List<Long> eventSeatIds);
}
