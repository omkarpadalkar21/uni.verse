package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubMembersDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubRejectionRequest;
import com.omkar.uni.verse.domain.dto.clubs.management.ClubManagementResponse;
import com.omkar.uni.verse.domain.dto.clubs.management.JoinClubRequest;
import com.omkar.uni.verse.domain.entities.clubs.ClubJoinRequest;
import com.omkar.uni.verse.domain.entities.clubs.JoinRequestStatus;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ClubManagementService {

    MessageResponse createClubJoinRequest(String slug, JoinClubRequest joinRequest);

    Page<ClubJoinRequest> getAllClubJoinRequests(String slug, JoinRequestStatus status, int offset, int pageSize);

    ClubManagementResponse approveClubJoinRequest(String slug, UUID id);

    ClubManagementResponse rejectClubJoinRequest(String slug, UUID userId, ClubRejectionRequest rejectionRequest);

    Page<ClubMembersDTO> getAllClubMembers(String slug, int offset, int pageSize);

    ClubManagementResponse promoteClubMember(String slug, UUID id);

    ClubManagementResponse removeClubMember(String slug, UUID id);

    ClubManagementResponse leaveClub(String slug);
}
