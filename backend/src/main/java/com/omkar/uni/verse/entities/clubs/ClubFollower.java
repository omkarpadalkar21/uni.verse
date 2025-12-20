package com.omkar.uni.verse.entities.clubs;

import com.omkar.uni.verse.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "clubs",
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

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @CreatedDate
    private LocalDateTime followedAt;

    public ClubFollower(User user, Club club) {
        this.id = new ClubFollowerId(user.getId(), club.getId());
        this.user = user;
        this.club = club;
    }
}
