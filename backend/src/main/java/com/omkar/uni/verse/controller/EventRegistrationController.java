package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.events.CancelEventRegistrationRequest;
import com.omkar.uni.verse.domain.dto.events.EventRegistrationResponse;
import com.omkar.uni.verse.domain.dto.events.EventRegistrationSummary;
import com.omkar.uni.verse.domain.dto.events.RejectEventRegistrationRequest;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import com.omkar.uni.verse.services.EventRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/{slug}/events/{id}")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventRegistrationService eventRegistrationService;

    @PostMapping("/register")
    public ResponseEntity<EventRegistrationResponse> createEventRegistration(@PathVariable String slug, @PathVariable UUID id) {
        return new ResponseEntity<>(
                eventRegistrationService.createEventRegistration(slug, id),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<PageResponse<EventRegistrationSummary>> getClubEventRegistrations(
            @PathVariable String slug,
            @PathVariable UUID id,
            @RequestBody(required = false) EventRegistrationStatus registrationStatus,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EventRegistrationSummary> page = eventRegistrationService.getClubEventRegistrations(
                slug, id, registrationStatus, offset, size
        );
        return ResponseEntity.ok().body(new PageResponse<>(
                page.getContent(),
                page.getTotalPages()
        ));
    }

    @PutMapping("/registrations/{userId}/approve")
    public ResponseEntity<EventRegistrationResponse> approveEventRegistration(
            @PathVariable String slug, @PathVariable UUID id, @PathVariable UUID userId
    ) {
        return ResponseEntity.ok().body(eventRegistrationService.approveEventRegistration(slug, id, userId));
    }

    @PutMapping("/registrations/{userId}/approve")
    public ResponseEntity<EventRegistrationResponse> rejectEventRegistration(
            @PathVariable String slug,
            @PathVariable UUID id,
            @PathVariable UUID userId,
            @RequestBody RejectEventRegistrationRequest rejectEventRegistrationRequest
    ) {
        return ResponseEntity.ok().body(eventRegistrationService.rejectEventRegistration(
                slug, id, userId, rejectEventRegistrationRequest)
        );
    }

    @DeleteMapping("/registrations")
    public ResponseEntity<MessageResponse> cancelEventRegistration(
            @PathVariable String slug,
            @PathVariable UUID id,
            @RequestBody CancelEventRegistrationRequest cancelEventRegistrationRequest
    ) {
        return ResponseEntity.ok().body(eventRegistrationService.cancelEventRegistration(slug, id, cancelEventRegistrationRequest));
    }

}
