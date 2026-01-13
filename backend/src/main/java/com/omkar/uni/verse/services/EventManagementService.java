package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.events.EventCancelRequest;
import com.omkar.uni.verse.domain.dto.events.EventCreateRequest;
import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.dto.events.EventUpdateRequest;

import java.util.UUID;

public interface EventManagementService {
    EventResponse createEvent(String slug, EventCreateRequest eventCreateRequest);


    EventResponse updateEventById(String slug, UUID eventId, EventUpdateRequest eventUpdateRequest);

    MessageResponse deleteEventById(String slug, UUID eventId);

    EventResponse publishEventsById(String slug, UUID eventId);

    EventResponse cancelEventsById(String slug, UUID eventId, EventCancelRequest eventCancelRequest);
}
