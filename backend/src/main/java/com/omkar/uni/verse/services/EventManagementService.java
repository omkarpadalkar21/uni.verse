package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.events.EventCreateRequest;
import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.dto.events.EventUpdateRequest;
import com.omkar.uni.verse.domain.entities.events.EventCategory;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.UUID;


//if (request.getIsPaid() && request.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
//        throw new IllegalArgumentException("Paid events must have a base price");
//}

public interface EventManagementService {
    EventResponse createEvent(EventCreateRequest eventCreateRequest);

    Page<EventResponse> getAllEvents(UUID clubId, EventCategory category,
                                     LocalDate date, int page, int size);

    EventResponse getEventById(UUID id);

    EventResponse updateEventById(EventUpdateRequest eventUpdationRequest);

    MessageResponse deleteEventById(UUID id);

    EventResponse publishEventsById(UUID id);

    EventResponse cancelEventsById(UUID id);
}
