package com.omkar.uni.verse.domain.dto.clubs.management;

import com.omkar.uni.verse.domain.dto.clubs.ClubSummary;
import com.omkar.uni.verse.domain.dto.user.UserBasicDTO;
import com.omkar.uni.verse.domain.entities.clubs.JoinRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ClubJoinRequestDTO {
    private UUID id;
    private UserBasicDTO user;
    private ClubSummary club;
    private JoinRequestStatus status;
    private String message;
    private String rejectionReason;
    private UserBasicDTO reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
