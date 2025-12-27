package com.omkar.uni.verse.domain.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;

@Getter
public class ResetPasswordRequest {
    @NotNull(message = "Email is required")
    @NotBlank(message = "Email can't be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^[0-9]{8}$", message = "OTP must be 8 characters")
    private String token;

    @NotEmpty(message = "Password is mandatory")
    @NotBlank(message = "Password is mandatory")
    @Size(min = 8, message = "Password should be at least {min} characters long")
    private String newPassword;
}
