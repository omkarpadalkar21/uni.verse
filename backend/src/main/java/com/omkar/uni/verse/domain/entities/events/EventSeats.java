package com.omkar.uni.verse.domain.entities.events;

import com.omkar.uni.verse.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Table(
        name = "event_seats",
        indexes = {
                @Index(name = "idx_event_seats_event_id", columnList = "event_id"),
                @Index(name = "idx_event_seats_status", columnList = "status"),
                @Index(name = "idx_event_seats_locked_by", columnList = "locked_by_user_id"),
                @Index(name = "idx_event_seats_lock_expires", columnList = "lock_expires_at")
        },
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "seat_id"})
)
@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EventSeats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SeatStatus status = SeatStatus.AVAILABLE;

    // locking mechanism
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locked_by_user_id")
    private User lockedBy;

    @Column(name = "lock_expires_at")
    private LocalDateTime lockExpiresAt;

    @Builder.Default
    @Column(name = "price", precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    // Optimistic locking
    @Version
    @Builder.Default
    private Integer version = 0;

    @Builder.Default
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
