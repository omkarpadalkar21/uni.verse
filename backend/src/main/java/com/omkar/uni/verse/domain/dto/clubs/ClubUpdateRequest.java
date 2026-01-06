package com.omkar.uni.verse.domain.dto.clubs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
public class ClubUpdateRequest {

    @Size(min = 3, max = 255, message = "Club name must be 3-255 characters")
    @NotNull
    @NotBlank
    private String name;

    @NotNull
    @NotBlank
    @Size(min = 50, max = 5000, message = "Description must be 50-5000 characters")
    private String description;

    @NotNull
    @URL(message = "Invalid logo URL")
    private String logoUrl;

    private Map<String, String> socialLinks = new HashMap<>();
}
