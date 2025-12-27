package com.omkar.uni.verse.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LogoutRequest {
    @NotBlank(message = "Refresh token is required")
    private String refreshToken;

    @NotBlank(message = "Access token is required")
    private String accessToken;
}
