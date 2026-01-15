package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.events.CancelEventRegistrationRequest;
import com.omkar.uni.verse.domain.dto.events.EventRegistrationResponse;
import com.omkar.uni.verse.domain.dto.events.EventRegistrationSummary;
import com.omkar.uni.verse.domain.dto.events.RejectEventRegistrationRequest;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface EventRegistrationService {
    EventRegistrationResponse createEventRegistration(UUID id);

    Page<EventRegistrationSummary> getClubEventRegistrations(String slug, UUID eventId, EventRegistrationStatus registrationStatus, int offset, int pageSize);

    Page<EventRegistrationSummary> getUserEventRegistrations(EventRegistrationStatus status, int offset, int pageSize);


    EventRegistrationResponse approveEventRegistration(String slug, UUID eventId, UUID userId);

    EventRegistrationResponse rejectEventRegistration(String slug, UUID eventId, UUID userId, RejectEventRegistrationRequest rejectEventRegistrationRequest);

    MessageResponse cancelEventRegistration(UUID eventId, CancelEventRegistrationRequest cancelEventRegistrationRequest);
}
