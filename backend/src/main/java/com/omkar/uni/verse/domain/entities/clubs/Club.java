package com.omkar.uni.verse.domain.entities.clubs;

import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.user.User;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.validator.constraints.URL;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(
        name = "clubs",
        indexes = {
                @Index(name = "idx_clubs_slug", columnList = "slug"),
                @Index(name = "idx_clubs_status", columnList = "status"),
                @Index(name = "idx_clubs_category", columnList = "category"),
                @Index(name = "idx_clubs_created_by", columnList = "created_by_user_id"),
                @Index(name = "idx_clubs_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    @Size(min = 3, max = 255, message = "Club name must be 3-255 characters")
    private String name;

    @Column(unique = true, nullable = false)
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Size(min = 50, max = 5000, message = "Description must be 50-5000 characters")
    private String description;

    //  Categorization

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ClubCategory clubCategory;

    // Store tags as PostgreSQL array
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags = new String[0];  // Use array, not Set

    //  Media

    @Column(name = "logo_url", length = 500)
    @URL(message = "Invalid logo URL")
    private String logoUrl;

    @Column(name = "banner_url", length = 500)
    @URL(message = "Invalid banner URL")
    private String bannerUrl;

    @Type(JsonBinaryType.class)
    @Column(name = "social_links", columnDefinition = "jsonb")
    private Map<String, String> socialLinks = new HashMap<>();
    // Example: {"instagram": "...", "linkedin": "...", "website": "..."}

    //  Status & Approval
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private ClubStatus clubStatus = ClubStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "suspension_reason", columnDefinition = "TEXT")
    private String suspensionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suspended_by_user_id")
    private User suspendedBy;

    @Column(name = "suspended_at")
    private LocalDateTime suspendedAt;

    //  Metrics

    @Column(name = "member_count", nullable = false)
    @Builder.Default
    private Integer memberCount = 0;

    @Column(name = "follower_count", nullable = false)
    @Builder.Default
    private Integer followerCount = 0;

    @Column(name = "event_count", nullable = false)
    @Builder.Default
    private Integer eventCount = 0;

    //  Relationships

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ClubMember> members = new HashSet<>();

    @OneToMany(mappedBy = "club")
    private Set<ClubFollower> followers = new HashSet<>();

    @OneToMany(mappedBy = "club")
    private Set<Event> events = new HashSet<>();

    //  Timestamps

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    //  Helper Methods

    @Transient
    public boolean isActive() {
        return clubStatus == ClubStatus.ACTIVE;
    }

    @Transient
    public boolean isPending() {
        return clubStatus == ClubStatus.PENDING;
    }

    public void approve(User approvedBy) {
        this.clubStatus = ClubStatus.ACTIVE;
        this.approvedBy = approvedBy;
        this.approvedAt = LocalDateTime.now();
    }

    public void reject(User rejectedBy, String reason) {
        this.clubStatus = ClubStatus.REJECTED;
        this.rejectionReason = reason;
        this.approvedBy = rejectedBy;
        this.approvedAt = LocalDateTime.now();
    }

    public void suspend(User suspendedBy, String reason) {
        this.clubStatus = ClubStatus.SUSPENDED;
        this.suspensionReason = reason;
        this.suspendedBy = suspendedBy;
        this.suspendedAt = LocalDateTime.now();
    }
}
