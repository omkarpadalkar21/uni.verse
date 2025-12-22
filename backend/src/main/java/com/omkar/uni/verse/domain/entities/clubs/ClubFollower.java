package com.omkar.uni.verse.domain.entities.clubs;

import com.omkar.uni.verse.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "club_followers",  // ✅ Fixed!
        indexes = {
                @Index(name = "idx_club_followers_club_id", columnList = "club_id"),
                @Index(name = "idx_club_followers_followed_at", columnList = "followed_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ClubFollower {
    @EmbeddedId
    private ClubFollowerId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("clubId")
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @CreatedDate
    @Column(name = "followed_at", nullable = false, updatable = false)
    private LocalDateTime followedAt;

    public ClubFollower(User user, Club club) {
        this.id = new ClubFollowerId(user.getId(), club.getId());
        this.user = user;
        this.club = club;
    }
}

