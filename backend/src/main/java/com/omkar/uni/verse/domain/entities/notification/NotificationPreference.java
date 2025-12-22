package com.omkar.uni.verse.domain.entities.notification;

import com.omkar.uni.verse.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class NotificationPreference {

    @Id
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    // Email preferences
    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private Boolean emailEnabled = true;

    @Column(name = "event_reminders", nullable = false)
    @Builder.Default
    private Boolean eventReminders = true;

    @Column(name = "club_updates", nullable = false)
    @Builder.Default
    private Boolean clubUpdates = true;

    @Column(name = "registration_alerts", nullable = false)
    @Builder.Default
    private Boolean registrationAlerts = true;

    @Column(name = "payment_alerts", nullable = false)
    @Builder.Default
    private Boolean paymentAlerts = true;

    // Push/in-app preferences
    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private Boolean pushEnabled = true;

    @Column(name = "in_app_enabled", nullable = false)
    @Builder.Default
    private Boolean inAppEnabled = true;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
