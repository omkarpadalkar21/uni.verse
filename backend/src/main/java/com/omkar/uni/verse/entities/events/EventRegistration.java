package com.omkar.uni.verse.entities.events;

import com.omkar.uni.verse.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "event_registration",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}),
        indexes = {
                @Index(name = "idx_event_registrations_event_id", columnList = "event_id"),
                @Index(name = "idx_event_registrations_user_id", columnList = "user_id"),
                @Index(name = "idx_event_registrations_status", columnList = "status"),
                @Index(name = "idx_event_registrations_registered_at", columnList = "registered_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn()
    private Event event;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private EventRegistrationStatus status = EventRegistrationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    // Approval workflow
    @ManyToOne
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedBy;

    private LocalDateTime reviewedAt;

    // Attendance
    private LocalDateTime checkedInAt;

    @ManyToOne
    @JoinColumn(name = "checked_in_by_user_id")
    private User checkedInBy;

    // Timestamps
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    private LocalDateTime cancelledAt;
}
