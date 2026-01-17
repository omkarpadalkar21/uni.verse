package com.omkar.uni.verse.domain.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserSuspensionReason(
        @Size(min = 5, max = 255, message = "Suspensions reason needs to be between {min} and {max} characters")
        @NotBlank
        String suspensionReason) {
}
