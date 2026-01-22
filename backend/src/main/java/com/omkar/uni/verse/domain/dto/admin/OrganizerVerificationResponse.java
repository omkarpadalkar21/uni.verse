package com.omkar.uni.verse.domain.dto.admin;

import com.omkar.uni.verse.domain.entities.clubs.VerificationStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class OrganizerVerificationResponse {
    private UUID id;
    private String userEmail;
    private VerificationStatus status;
    private String documentUrl;
    private String documentType;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
