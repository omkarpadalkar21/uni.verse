package com.omkar.uni.verse.domain.dto.clubs;

import com.omkar.uni.verse.domain.entities.clubs.ClubCategory;
import com.omkar.uni.verse.domain.entities.clubs.LeadershipRole;
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
public class ClubRegistrationRequest {

    @Size(min = 3, max = 255, message = "Club name must be 3-255 characters")
    @NotNull
    @NotBlank
    private String name;

    @NotNull
    @NotBlank
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @NotNull
    @NotBlank
    @Size(min = 50, max = 5000, message = "Description must be 50-5000 characters")
    private String description;

    @NotNull
    private ClubCategory clubCategory;

    @NotNull
    @URL(message = "Invalid logo URL")
    private String logoUrl;

    @NotNull
    private LeadershipRole role;

    private Map<String, String> socialLinks = new HashMap<>();
}
