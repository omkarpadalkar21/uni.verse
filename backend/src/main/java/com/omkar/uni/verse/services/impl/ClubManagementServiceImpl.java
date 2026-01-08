package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubMembersDTO;
import com.omkar.uni.verse.domain.dto.clubs.management.JoinClubRequest;
import com.omkar.uni.verse.domain.dto.clubs.management.JoinClubResponse;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubJoinRequest;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.repository.ClubJoinRequestRepository;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.services.ClubManagementService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClubManagementServiceImpl implements ClubManagementService {

    private final ClubJoinRequestRepository clubJoinRequestRepository;
    private final ClubRepository clubRepository;

    @Override
    public MessageResponse createClubJoinRequest(String slug, JoinClubRequest joinRequest) {

        Club club = clubRepository.findBySlugAndClubStatus(slug, ClubStatus.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        User user = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (clubJoinRequestRepository.existsClubJoinRequestByUserAndClub(user, club)) {
            log.warn("Club joining request already exists User {} in Club: {}.", user.getEmail(), club.getName());
            throw new IllegalArgumentException("Club joining request already exists. Please wait for approval!");
        }

        ClubJoinRequest clubJoinRequest = ClubJoinRequest.builder()
                .user(user)
                .club(club)
                .message(joinRequest.message())
                .build();

        clubJoinRequestRepository.save(clubJoinRequest);

        log.info("Club joining request created for User: {} in Club : {}", user.getEmail(), club.getName());

        return new MessageResponse("Club joining request sent successfully");
    }

    @Override
    public Page<ClubJoinRequest> getAllClubJoinRequests(String slug) {
        return null;
    }

    @Override
    public JoinClubResponse approveClubJoinRequest(String slug, UUID id) {
        return null;
    }

    @Override
    public JoinClubResponse rejectClubJoinRequest(String slug, UUID id) {
        return null;
    }

    @Override
    public ClubMembersDTO getAllClubMembers(String slug) {
        return null;
    }

    @Override
    public JoinClubResponse promoteClubMember(String slug, UUID id) {
        return null;
    }

    @Override
    public JoinClubResponse removeClubMember(String slug, UUID id) {
        return null;
    }

    @Override
    public JoinClubResponse leaveClub(String slug) {
        return null;
    }
}
