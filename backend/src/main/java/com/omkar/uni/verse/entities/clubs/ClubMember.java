package com.omkar.uni.verse.entities.clubs;

import com.omkar.uni.verse.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "club_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"club_id", "user_id"}),
        indexes = {
                @Index(name = "idx_club_members_club_id", columnList = "club_id"),
                @Index(name = "idx_club_members_user_id", columnList = "user_id"),
                @Index(name = "idx_club_members_role", columnList = "role"),
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ClubMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(length = 50, nullable = false)
    private ClubRole role;

    @ManyToOne
    @JoinColumn(name = "added_by_user_id")
    private User addedByUser;

    @CreatedDate
    private LocalDateTime joinedAt;

    private LocalDateTime leftAt;
}
