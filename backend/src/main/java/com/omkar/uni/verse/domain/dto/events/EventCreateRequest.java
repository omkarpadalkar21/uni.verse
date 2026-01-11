package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.events.EventCategory;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationMode;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.domain.entities.events.EventVisibility;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class EventCreateRequest {
    @NotNull
    private UUID clubId;

    @NotBlank
    @Size(min = 3, max = 255, message = "The title needs to be between {min} and {max} characters")
    private String title;

    @NotBlank
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @NotBlank
    @Size(min = 5, max = 255, message = "The description needs to be between {min} and {max} characters")
    private String description;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeValid() {
        return startTime != null && endTime != null && endTime.isAfter(startTime);
    }

    @NotNull
    @NotNull
    private Integer venueId;

    @NotNull
    private Integer capacity;

    @NotNull
    private Boolean isPaid = false;

    private BigDecimal basePrice = BigDecimal.ZERO;

    @NotNull
    private EventRegistrationMode registrationMode = EventRegistrationMode.AUTO_APPROVE;

    @NotNull
    private EventVisibility visibility = EventVisibility.PUBLIC;

    @NotNull
    private EventStatus status = EventStatus.DRAFT;

    @URL
    private String bannerUrl;

    @URL
    private String thumbnailUrl;

    @NotNull
    private EventCategory category;
}
