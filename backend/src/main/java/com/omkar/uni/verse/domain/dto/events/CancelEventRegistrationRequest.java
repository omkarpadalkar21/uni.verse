package com.omkar.uni.verse.domain.dto.events;

import jakarta.validation.constraints.Size;

public record CancelEventRegistrationRequest(
        @Size(min = 5, max = 255, message = "Cancellation reason needs to be between {min} and {max} characters")
        String cancellationReason) {
}
