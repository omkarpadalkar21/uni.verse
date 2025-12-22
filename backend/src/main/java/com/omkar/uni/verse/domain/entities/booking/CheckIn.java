package com.omkar.uni.verse.domain.entities.booking;

import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventRegistration;
import com.omkar.uni.verse.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "check_ins",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}),
        indexes = {
                @Index(name = "idx_check_ins_event_id", columnList = "event_id"),
                @Index(name = "idx_check_ins_user_id", columnList = "user_id"),
                @Index(name = "idx_check_ins_checked_at", columnList = "checked_in_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private EventRegistration registration;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_in_method", length = 20, nullable = false)
    private CheckInMethod checkInMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by_user_id", nullable = false)
    private User checkedInBy;

    @CreatedDate
    @Column(name = "checked_in_at", nullable = false, updatable = false)
    private LocalDateTime checkedInAt;
}
