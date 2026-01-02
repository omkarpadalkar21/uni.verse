package com.omkar.uni.verse.domain.dto;

import com.omkar.uni.verse.domain.entities.user.RoleName;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RegistrationRequest {
    @NotNull(message = "Email is required")
    @NotBlank(message = "Email can't be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least {min} characters")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^(\\+91)?[6-9]\\d{9}$",
            message = "Invalid phone number format"
    )
    private String phone;

    @NotBlank(message = "University ID is required")
    @Size(min = 8, max = 25, message = "University ID must be between {min} and {max} characters")
    private String universityId;

    // Organizers for club leaders, null otherwise
    private String intendedRole;
}
