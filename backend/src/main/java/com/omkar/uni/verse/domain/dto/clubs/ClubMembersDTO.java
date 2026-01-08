package com.omkar.uni.verse.domain.dto.clubs;

import com.omkar.uni.verse.domain.entities.clubs.ClubRole;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ClubMembersDTO {
    private String user;
    private ClubRole role;
    private LocalDateTime joinedAt;
}
