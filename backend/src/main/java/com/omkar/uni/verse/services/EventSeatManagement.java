package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.events.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface EventSeatManagement {
    VenueSummary addNewVenue(CreateVenueRequest createVenueRequest);

    Page<VenueSummary> getAllVenues(int pageSize, int offset);

    EventSeatResponse getEventSeats(UUID eventId);

    SeatLockResponse lockSeats(UUID eventId, List<Long> seatIds);

    BookingSeatDTO bookingConfirmation(UUID bookingId);
}
