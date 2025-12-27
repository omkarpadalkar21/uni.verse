package com.omkar.uni.verse.domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ForgotPasswordRequest {
    @NotNull(message = "Email is required")
    @NotBlank(message = "Email can't be blank")
    @Email(message = "Invalid email format")
    private String email;
}
