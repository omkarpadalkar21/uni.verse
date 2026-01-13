package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.entities.events.EventCategory;
import org.springframework.data.domain.Page;


import java.time.LocalDateTime;
import java.util.UUID;

public interface EventService {
    Page<EventResponse> getAllEvents(UUID clubId, EventCategory category,
                                     LocalDateTime dateTime, int page, int size);

    EventResponse getEventById(UUID id);
}
