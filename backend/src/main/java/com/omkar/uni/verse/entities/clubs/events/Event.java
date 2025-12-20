package com.omkar.uni.verse.entities.clubs.events;

import com.omkar.uni.verse.entities.clubs.Club;
import com.omkar.uni.verse.entities.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.validator.constraints.URL;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "events",
        indexes = {
                @Index(name = "idx_events_club_id", columnList = "club_id"),
                @Index(name = "idx_events_slug", columnList = "slug"),
                @Index(name = "idx_events_status", columnList = "status"),
                @Index(name = "idx_events_start_time", columnList = "start_time"),
                @Index(name = "idx_events_category", columnList = "category"),
                @Index(name = "idx_events_created_at", columnList = "created_at"),
                @Index(name = "idx_events_visibility", columnList = "visibility")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    // Event details
    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @Column(nullable = false)
    private String description;

    // Schedule
    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    // Venue
    @Enumerated(EnumType.STRING)
    private VenueType type;

    @ManyToOne
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @URL
    @Column(length = 500)
    private String onlineLink;

    // Capacity & registration
    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    private EventRegistrationMode registrationMode = EventRegistrationMode.AUTO_APPROVE;

    @Column(nullable = false)
    private LocalDateTime registrationDeadline;

    // Pricing
    @Builder.Default
    @Column(nullable = false)
    private Boolean isPaid = false;

    @Builder.Default
    private Double basePrice = 0D;

    // currency not required, targeted only for Indian Universities

    // Visibility & status
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private EventVisibility visibility = EventVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    // Media
    @URL
    @Column(length = 500)
    private String bannerUrl;

    @URL
    @Column(length = 500)
    private String thumbnailUrl;

    // Categorization
    @Enumerated(EnumType.STRING)
    private EventCategory category;

    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags = new String[0];

    // Metrics
    @Builder.Default
    private Integer registrationCount = 0;

    @Builder.Default
    private Integer attendanceCount = 0;

    // Timestamps
    @ManyToOne
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime publishedAt;

    private LocalDateTime cancelledAt;
}
