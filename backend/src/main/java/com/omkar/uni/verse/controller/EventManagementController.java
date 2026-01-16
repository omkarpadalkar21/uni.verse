package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.events.*;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import com.omkar.uni.verse.services.EventManagementService;
import com.omkar.uni.verse.services.EventRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/{slug}/events")
@RequiredArgsConstructor
public class EventManagementController {
    private final EventManagementService eventManagementService;
    private final EventRegistrationService eventRegistrationService;

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @PathVariable String slug,
            @RequestBody @Valid EventCreateRequest eventCreateRequest
    ) {
        return new ResponseEntity<>(
                eventManagementService.createEvent(slug, eventCreateRequest),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEventById(
            @PathVariable String slug,
            @PathVariable UUID id,
            @RequestBody @Valid EventUpdateRequest eventUpdateRequest
    ) {
        return ResponseEntity.ok().body(eventManagementService.updateEventById(slug, id, eventUpdateRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteEventById(@PathVariable String slug, @PathVariable UUID id) {
        return ResponseEntity.ok().body(eventManagementService.deleteEventById(slug, id));
    }

    @PutMapping("/{eventId}/publish")
    public ResponseEntity<EventResponse> publishEventById(
            @PathVariable String slug,
            @PathVariable UUID eventId
    ) {
        return ResponseEntity.ok().body(eventManagementService.publishEventsById(slug, eventId));
    }

    @PutMapping("/{eventId}/cancelled")
    public ResponseEntity<EventResponse> cancelEventById(
            @PathVariable String slug,
            @PathVariable UUID eventId,
            @RequestBody @Valid EventCancelRequest eventCancelRequest
    ) {
        return ResponseEntity.ok().body(eventManagementService.cancelEventsById(slug, eventId, eventCancelRequest));
    }

}
