package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.admin.OrganizerRejectionReason;
import com.omkar.uni.verse.domain.dto.admin.OrganizerVerificationResponse;
import com.omkar.uni.verse.domain.dto.admin.PlatformStatsDTO;
import com.omkar.uni.verse.domain.dto.admin.UserSuspensionReason;
import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.user.UserBasicDTO;
import com.omkar.uni.verse.domain.dto.user.UserProfileResponse;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import com.omkar.uni.verse.domain.entities.clubs.VerificationStatus;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.domain.entities.user.AccountStatus;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface AdminPanelService {
    Page<ClubDTO> getClubs(ClubStatus status, int offset, int pageSize);

    Page<UserBasicDTO> getUsers(AccountStatus accountStatus, RoleName roleName, int offset, int pageSize);

    UserProfileResponse promoteToFaculty(UUID userId);

    UserProfileResponse suspendUser(UUID userId, UserSuspensionReason suspensionReason);

    PlatformStatsDTO getPlatformStats(ClubStatus clubStatus, EventStatus eventStatus, AccountStatus status);

    MessageResponse approveOrganizer(UUID id);

    MessageResponse rejectOrganizer(UUID id, OrganizerRejectionReason rejectionReason);

    Page<OrganizerVerificationResponse> getOrganizerVerificationRequests(VerificationStatus status, int offset, int pageSize);

    OrganizerVerificationResponse getOrganizerVerificationRequest(UUID id);
}
