package com.omkar.uni.verse.domain.entities.clubs;

import com.omkar.uni.verse.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "club_leaders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubLeader {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeadershipRole role;

    @Column(name = "appointed_at")
    private LocalDateTime appointedAt;
}

