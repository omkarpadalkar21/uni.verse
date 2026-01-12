package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.dto.clubs.ClubSummary;
import com.omkar.uni.verse.domain.entities.events.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private UUID id;
    private String title;
    private String slug;
    private String description;

    // Schedule
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Venue
    private VenueSummary venue;
    private VenueType type;
    private String onlineLink;

    // Capacity & registration
    private Integer capacity;
    private EventRegistrationMode registrationMode;
    private LocalDateTime registrationDeadline;

    // Pricing
    private Boolean isPaid;
    private BigDecimal basePrice;

    // Visibility & status
    private EventVisibility visibility;
    private EventStatus status;
    private String cancellationReason;

    // Media
    private String bannerUrl;
    private String thumbnailUrl;

    // Categorization
    private EventCategory category;
    private String[] tags;

    // Metrics
    private Integer registrationCount;
    private Integer attendanceCount;

    // Relationships
    private ClubSummary club;
    private String createdByUser;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;

    // User-specific
    private Boolean isRegistered;

    // Computed properties
    public Integer getAvailableSeats() {
        if (capacity == null || registrationCount == null) {
            return 0;
        }
        return Math.max(0, capacity - registrationCount);
    }

}
