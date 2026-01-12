package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.events.EventCancelRequest;
import com.omkar.uni.verse.domain.dto.events.EventCreateRequest;
import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.dto.events.EventUpdateRequest;
import com.omkar.uni.verse.domain.entities.events.EventCategory;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.UUID;


//if (request.getIsPaid() && request.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
//        throw new IllegalArgumentException("Paid events must have a base price");
//}

public interface EventManagementService {
    EventResponse createEvent(String slug, EventCreateRequest eventCreateRequest);

    Page<EventResponse> getAllEvents(UUID clubId, EventCategory category,
                                     LocalDateTime dateTime, int page, int size);

    EventResponse getEventById(UUID id);

    EventResponse updateEventById(String slug, UUID eventId, EventUpdateRequest eventUpdateRequest);

    MessageResponse deleteEventById(String slug, UUID eventId);

    EventResponse publishEventsById(String slug, UUID eventId);

    EventResponse cancelEventsById(String slug, UUID eventId, EventCancelRequest eventCancelRequest);
}
