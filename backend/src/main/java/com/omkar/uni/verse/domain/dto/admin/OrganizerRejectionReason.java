package com.omkar.uni.verse.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrganizerRejectionReason(
        @Size(min = 3, max = 255, message = "The rejection reason needs to be between {min} and {max} characters")
        @NotBlank
        String message) {
}
