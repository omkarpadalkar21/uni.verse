package com.omkar.uni.verse.domain.dto.events;

import jakarta.validation.constraints.Size;

public record RejectEventRegistrationRequest(
        @Size(min = 5, max = 255, message = "Rejection reason needs to be between {min} and {max} characters")
        String rejectionReason) {
}
