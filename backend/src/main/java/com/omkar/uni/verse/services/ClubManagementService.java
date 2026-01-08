package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubMembersDTO;
import com.omkar.uni.verse.domain.dto.clubs.management.JoinClubRequest;
import com.omkar.uni.verse.domain.dto.clubs.management.JoinClubResponse;
import com.omkar.uni.verse.domain.entities.clubs.ClubJoinRequest;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ClubManagementService {

    MessageResponse createClubJoinRequest(String slug, JoinClubRequest joinRequest);

    Page<ClubJoinRequest> getAllClubJoinRequests(String slug);

    JoinClubResponse approveClubJoinRequest(String slug, UUID id);

    JoinClubResponse rejectClubJoinRequest(String slug, UUID id);

    ClubMembersDTO getAllClubMembers(String slug);

    JoinClubResponse promoteClubMember(String slug, UUID id);

    JoinClubResponse removeClubMember(String slug, UUID id);

    JoinClubResponse leaveClub(String slug);
}
