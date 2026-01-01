package com.omkar.uni.verse.domain.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UpdateUserProfileRequest {

    @NotNull(message = "Email is required")
    @NotBlank(message = "Email can't be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 125, message = "First name must be between {min} and {max} characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 125, message = "Last name must be between {min} and {max} characters")
    private String lastName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 20)
    private String phone;

    private String bio;

    @Size(max = 500, message = "Avatar url can be at max {max} characters")
    private String avatarUrl;
}
