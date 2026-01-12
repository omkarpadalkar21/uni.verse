package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubMembersDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubRejectionRequest;
import com.omkar.uni.verse.domain.dto.clubs.management.JoinClubRequest;
import com.omkar.uni.verse.domain.dto.clubs.management.ClubManagementResponse;
import com.omkar.uni.verse.domain.entities.clubs.*;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.repository.ClubJoinRequestRepository;
import com.omkar.uni.verse.repository.ClubLeaderRepository;
import com.omkar.uni.verse.repository.ClubMemberRepository;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.repository.UserRepository;
import com.omkar.uni.verse.services.ClubManagementService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClubManagementServiceImpl implements ClubManagementService {

    private final ClubJoinRequestRepository clubJoinRequestRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubLeaderRepository clubLeaderRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
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


    //    GET /clubs/my-club/join-requests?page=0&size=20 → First 20 records
    //    GET /clubs/my-club/join-requests?page=1&size=20 → Next 20 records
    //    GET /clubs/my-club/join-requests?page=2&size=20 → Records 41-60
    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class, readOnly = true)
    public Page<ClubJoinRequest> getAllClubJoinRequests(String slug, int offset, int pageSize) {
        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to view join requests for club '{}' (slug: {}) but is not a leader",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to get details of this club!");
        }

        return clubJoinRequestRepository.findClubJoinRequestByClub(club,
                PageRequest.of(offset, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    public ClubManagementResponse approveClubJoinRequest(String slug, UUID id) {
        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to approve join request for club '{}' (slug: {}) but is not a leader",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to update this club!");
        }

        User userRequestingToJoinClub = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with club joining request"));

        if (clubMemberRepository.existsByUserAndClubAndLeftAtIsNull(userRequestingToJoinClub, club)) {
            throw new IllegalStateException("User is already a member of this club");
        }

        ClubJoinRequest clubJoinRequest = clubJoinRequestRepository
                .findClubJoinRequestByUserAndClub(userRequestingToJoinClub, club)
                .orElseThrow(() -> new IllegalArgumentException("No club joining request found for User:" + userRequestingToJoinClub.getEmail()));

        clubJoinRequest.setStatus(JoinRequestStatus.APPROVED);
        clubJoinRequest.setReviewedBy(currentUser);
        clubJoinRequest.setReviewedAt(LocalDateTime.now());

        clubJoinRequestRepository.save(clubJoinRequest);

        ClubMember newClubMember = ClubMember.builder()
                .user(userRequestingToJoinClub)
                .club(club)
                .addedBy(currentUser)
                .build();

        clubMemberRepository.save(newClubMember);

        return new ClubManagementResponse(
                "Successfully created membership"
                , ClubRole.MEMBER
        );
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    public ClubManagementResponse rejectClubJoinRequest(String slug, UUID userId, ClubRejectionRequest rejectionRequest) {
        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to reject join request for club '{}' (slug: {}) but is not a leader",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to update this club!");
        }

        User userRequestingToJoinClub = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with club joining request"));

        ClubJoinRequest clubJoinRequest = clubJoinRequestRepository
                .findClubJoinRequestByUserAndClub(userRequestingToJoinClub, club)
                .orElseThrow(() -> new IllegalArgumentException("No club joining request found for User:" + userRequestingToJoinClub.getEmail()));

        clubJoinRequest.setStatus(JoinRequestStatus.REJECTED);
        clubJoinRequest.setRejectionReason(rejectionRequest.reason());
        clubJoinRequest.setReviewedBy(currentUser);
        clubJoinRequest.setReviewedAt(LocalDateTime.now());
        clubJoinRequestRepository.save(clubJoinRequest);

        return new ClubManagementResponse(
                "Successfully rejected membership request"
                , null
        );
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_CLUB_LEADER','ROLE_CLUB_MEMBER')")
    @Transactional(rollbackFor = Exception.class, readOnly = true)
    public Page<ClubMembersDTO> getAllClubMembers(String slug, int offset, int pageSize) {
        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser)) && club.getMembers().stream().noneMatch(clubMember -> clubMember.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to get club members for club '{}' (slug: {}) but is not a leader/member",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to get details of this club!");
        }

        List<ClubLeader> leaders = clubLeaderRepository.findByClub(club);
        List<ClubMember> members = clubMemberRepository.findByClubAndLeftAtIsNull(club);

        List<ClubMembersDTO> leaderDTOs = leaders.stream()
                .map(leader -> ClubMembersDTO.builder()
                        .user(leader.getUser().getFullName())
                        .role(ClubRole.LEADER)
                        .joinedAt(leader.getAppointedAt())
                        .build())
                .toList();

        List<ClubMembersDTO> memberDTOs = members.stream()
                .map(member -> ClubMembersDTO.builder()
                        .user(member.getUser().getFullName())
                        .role(ClubRole.MEMBER)
                        .joinedAt(member.getJoinedAt())
                        .build())
                .toList();

        List<ClubMembersDTO> allMembers = new ArrayList<>();
        allMembers.addAll(leaderDTOs);
        allMembers.addAll(memberDTOs);

        // Sort by joinedAt descending (most recent first)
        allMembers.sort((a, b) -> b.getJoinedAt().compareTo(a.getJoinedAt()));

        // Apply manual pagination
        int start = offset * pageSize;
        int end = Math.min(start + pageSize, allMembers.size());

        List<ClubMembersDTO> paginatedMembers = start >= allMembers.size()
                ? Collections.emptyList()
                : allMembers.subList(start, end);

        return new PageImpl<>(paginatedMembers, PageRequest.of(offset, pageSize), allMembers.size());
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    public ClubManagementResponse promoteClubMember(String slug, UUID id) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to promote club members for club '{}' (slug: {}) but is not a leader",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to update this club!");
        }

        User userToBePromoted = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found to be promoted"));

        ClubMember memberToBePromoted = clubMemberRepository.findByUser(userToBePromoted)
                .orElseThrow(() -> new EntityNotFoundException("The provided user isn't a member of the respective club"));


        clubMemberRepository.removeClubMemberById(memberToBePromoted.getId());

        userToBePromoted.setRole(RoleName.CLUB_LEADER);
        userRepository.save(userToBePromoted);

        ClubLeader newClubLeader = ClubLeader.builder()
                .club(club)
                .user(userToBePromoted)
                .role(LeadershipRole.SECRETARY) // TODO: Add enum field for dynamical role allocation
                .appointedAt(LocalDateTime.now())
                .build();

        clubLeaderRepository.save(newClubLeader);

        return new ClubManagementResponse(
                "User successfully promoted",
                ClubRole.LEADER
        );
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    public ClubManagementResponse removeClubMember(String slug, UUID id) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to remove club members for club '{}' (slug: {}) but is not a leader",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to update this club!");
        }

        User userToBeRemoved = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found to be removed"));

        removeClubMember(userToBeRemoved, club);

        log.info("User {} successfully removed from club '{}' by {}",
                userToBeRemoved.getEmail(), club.getName(), currentUser.getEmail());

        return new ClubManagementResponse(
                "User successfully removed from club",
                null
        );
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_MEMBER')")
    @Transactional(rollbackFor = Exception.class)
    public ClubManagementResponse leaveClub(String slug) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getMembers().stream().noneMatch(clubMember -> clubMember.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to leave club  '{}' (slug: {}) but is not a member",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to update this club!");
        }

        removeClubMember(currentUser, club);

        log.info("User {} successfully left from club '{}'",
                currentUser.getEmail(), club.getName());

        return new ClubManagementResponse(
                "Successfully left from club",
                null
        );
    }

    private void removeClubMember(User currentUser, Club club) {
        ClubMember clubMember = clubMemberRepository.findByUserAndClubAndLeftAtIsNull(currentUser, club)
                .orElseThrow(() -> new EntityNotFoundException("User is not an active member of this club"));

        clubMember.setLeftAt(LocalDateTime.now());
        clubMemberRepository.save(clubMember);

        // Atomically decrement member count to avoid race conditions
        clubRepository.decrementMemberCount(club.getId());
    }
}
