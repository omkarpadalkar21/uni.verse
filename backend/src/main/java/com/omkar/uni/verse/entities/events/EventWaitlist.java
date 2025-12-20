package com.omkar.uni.verse.entities.events;

import com.omkar.uni.verse.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "event_waitlist",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}),
        indexes = {
                @Index(name = "idx_event_waitlist_event_id", columnList = "event_id"),
                @Index(name = "idx_event_waitlist_user_id", columnList = "user_id"),
                @Index(name = "idx_event_waitlist_position", columnList = "position"),
                @Index(name = "idx_event_waitlist_added_at", columnList = "added_at")
        }

)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EventWaitlist {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User userId;

    @Column(nullable = false)
    private Integer position;

    @CreatedDate
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @Column(name = "promoted_at")
    private LocalDateTime promotedAt;
}
