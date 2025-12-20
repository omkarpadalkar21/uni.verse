package com.omkar.uni.verse.entities.clubs;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ClubFollowerId implements Serializable {
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "club_id")
    private UUID clubId;
}
