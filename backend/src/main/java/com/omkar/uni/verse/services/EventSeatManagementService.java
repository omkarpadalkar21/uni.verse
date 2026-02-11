package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.events.CreateVenueRequest;
import com.omkar.uni.verse.domain.dto.events.EventSeatResponse;
import com.omkar.uni.verse.domain.dto.events.VenueSummary;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface EventSeatManagementService {
    VenueSummary addNewVenue(CreateVenueRequest createVenueRequest);

    Page<VenueSummary> getAllVenues(int pageSize, int offset);

    EventSeatResponse getEventSeats(UUID eventId);

}
