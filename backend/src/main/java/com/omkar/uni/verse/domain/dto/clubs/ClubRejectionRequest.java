package com.omkar.uni.verse.domain.dto.clubs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClubRejectionRequest(
        @NotBlank
        @NotNull
        String reason) {

}
