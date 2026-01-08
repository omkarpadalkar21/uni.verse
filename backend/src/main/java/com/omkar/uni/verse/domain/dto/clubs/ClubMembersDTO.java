package com.omkar.uni.verse.domain.dto.clubs;

import com.omkar.uni.verse.domain.entities.clubs.ClubRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ClubMembersDTO {
    private String user; // Full name of the user
    private ClubRole role;
    private LocalDateTime joinedAt;
}
