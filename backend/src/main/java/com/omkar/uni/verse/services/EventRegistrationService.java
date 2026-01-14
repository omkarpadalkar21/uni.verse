package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.events.EventRegistrationResponse;

import java.util.UUID;

public interface EventRegistrationService {
    EventRegistrationResponse createEventRegistration(UUID id);
}
