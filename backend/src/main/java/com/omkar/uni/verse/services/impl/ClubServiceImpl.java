package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubRegistrationRequest;
import com.omkar.uni.verse.domain.dto.clubs.ClubResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubUpdateRequest;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubLeader;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.mappers.ClubMapper;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.services.ClubService;
import com.omkar.uni.verse.utils.PaginationValidator;
import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClubServiceImpl implements ClubService {

    private final ClubRepository clubRepository;
    private final ClubMapper clubMapper;

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    public ClubResponse registerNewClub(ClubRegistrationRequest registrationRequest) {
        log.debug("Attempting to register new club with slug: {}", registrationRequest.getSlug());

        // Get the current authenticated user
        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        log.debug("Club registration initiated by user: {} (ID: {})",
                currentUser.getEmail(), currentUser.getId());

        // Check if club slug already exists (optional but recommended validation)
        if (clubRepository.existsBySlug(registrationRequest.getSlug())) {
            log.warn("Club registration failed: slug '{}' already exists", registrationRequest.getSlug());
            throw new IllegalArgumentException("Club with slug " + registrationRequest.getSlug() + " already exists");
        }

        // Create new Club entity using mapper
        Club club = clubMapper.toEntity(registrationRequest);

        // Set fields not covered by the mapper
        club.setCreatedBy(currentUser);
        club.setClubStatus(ClubStatus.PENDING);
        club.setMemberCount(1); // Creator is the first member
        club.setFollowerCount(0);
        club.setEventCount(0);
        club.setTags(new String[0]); // Initialize empty tags
        club.getLeaders().add(
                ClubLeader.builder()
                        .club(club)
                        .user(currentUser)
                        .role(registrationRequest.getRole()) // TODO: Verify the requested role when validating the verification document
                        .appointedAt(LocalDateTime.now())
                        .build()
        );

        Club savedClub = clubRepository.save(club);
        log.info("Successfully registered new club: '{}' (slug: {}, ID: {}) by user: {}",
                savedClub.getName(), savedClub.getSlug(), savedClub.getId(), currentUser.getEmail());

        return clubMapper.toRegistrationResponse(savedClub);
    }

    @Override
    public Page<ClubDTO> getAllClubs(int offset, int pageSize) {
        log.debug("Fetching all active clubs - page: {}, size: {}", offset, pageSize);

        PageRequest pageRequest = PaginationValidator.createValidatedPageRequest(offset, pageSize);
        Page<ClubDTO> clubs = clubRepository.findAllByClubStatus(ClubStatus.ACTIVE, pageRequest)
                .map(clubMapper::toClubDTO);

        log.debug("Retrieved {} active clubs out of {} total", clubs.getNumberOfElements(), clubs.getTotalElements());
        return clubs;
    }

    @Override
    public ClubDTO getClubBySlug(String slug) {
        log.debug("Fetching active club by slug: {}", slug);

        Club club = clubRepository.findBySlugAndClubStatus(slug, ClubStatus.ACTIVE)
                .orElseThrow(() -> {
                    log.warn("Club not found or not active with slug: {}", slug);
                    return new EntityNotFoundException("Club not found.");
                });

        log.debug("Successfully retrieved club: '{}' (ID: {})", club.getName(), club.getId());
        return clubMapper.toClubDTO(club);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    public ClubDTO updateClubBySlug(String slug, ClubUpdateRequest clubUpdateRequest) {
        log.debug("Attempting to update club with slug: {}", slug);

        Club club = clubRepository.findBySlugAndClubStatus(slug, ClubStatus.ACTIVE)
                .orElseThrow(() -> {
                    log.warn("Update failed: Club not found or not active with slug: {}", slug);
                    return new EntityNotFoundException("Club not found or not activated!");
                });

        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        log.debug("Update requested by user: {} (ID: {}) for club: '{}' (ID: {})",
                currentUser.getEmail(), currentUser.getId(), club.getName(), club.getId());

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} is not a leader of club '{}' (slug: {})",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to update this club!");
        }

        String oldName = club.getName();
        club.setName(clubUpdateRequest.getName());
        club.setDescription(clubUpdateRequest.getDescription());
        club.setLogoUrl(clubUpdateRequest.getLogoUrl());
        club.setSocialLinks(clubUpdateRequest.getSocialLinks());
        clubRepository.save(club);

        log.info("Successfully updated club '{}' -> '{}' (slug: {}) by user: {}",
                oldName, club.getName(), slug, currentUser.getEmail());

        return clubMapper.toClubDTO(club);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_FACULTY')")
    @Transactional(rollbackFor = Exception.class)
    public ClubResponse approveClubBySlug(String slug) {
        log.debug("Attempting to approve club with slug: {}", slug);

        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Approval failed: Club not found with slug: {}", slug);
                    return new EntityNotFoundException("Club not found.");
                });

        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        log.debug("Approval requested by {} for club: '{}' (current status: {})",
                currentUser.getEmail(), club.getName(), club.getClubStatus());

        if (club.getClubStatus() == ClubStatus.ACTIVE) {
            log.warn("Approval failed: Club '{}' (slug: {}) is already approved", club.getName(), slug);
            throw new IllegalArgumentException("Club is already approved");
        }

        // Only allow approval from PENDING status
        if (club.getClubStatus() != ClubStatus.PENDING) {
            log.warn("Approval failed: Club '{}' (slug: {}) has status {} - only PENDING clubs can be approved",
                    club.getName(), slug, club.getClubStatus());
            throw new IllegalStateException("Only pending clubs can be approved");
        }

        club.setClubStatus(ClubStatus.ACTIVE);
        Club savedClub = clubRepository.save(club);

        log.info("Successfully approved club: '{}' (slug: {}, ID: {}) by {}",
                savedClub.getName(), slug, savedClub.getId(), currentUser.getEmail());

        // TODO: Consider sending notification to club leaders

        return clubMapper.toRegistrationResponse(savedClub);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_FACULTY')")
    @Transactional(rollbackFor = Exception.class)
    public ClubResponse rejectClubBySlug(String slug) {
        log.debug("Attempting to reject club with slug: {}", slug);

        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Rejection failed: Club not found with slug: {}", slug);
                    return new EntityNotFoundException("Club not found.");
                });

        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        log.debug("Rejection requested by {} for club: '{}' (current status: {})",
                currentUser.getEmail(), club.getName(), club.getClubStatus());

        if (club.getClubStatus() == ClubStatus.REJECTED) {
            log.warn("Rejection failed: Club '{}' (slug: {}) is already rejected", club.getName(), slug);
            throw new IllegalArgumentException("Club is already rejected");
        }

        // Only allow rejection from PENDING status
        if (club.getClubStatus() != ClubStatus.PENDING) {
            log.warn("Rejection failed: Club '{}' (slug: {}) has status {} - only PENDING clubs can be rejected",
                    club.getName(), slug, club.getClubStatus());
            throw new IllegalStateException("Only pending clubs can be rejected");
        }

        club.setClubStatus(ClubStatus.REJECTED);
        Club savedClub = clubRepository.save(club);

        log.info("Successfully rejected club: '{}' (slug: {}, ID: {}) by {}",
                savedClub.getName(), slug, savedClub.getId(), currentUser.getEmail());

        // TODO: Consider sending notification to club leaders with rejection reason

        return clubMapper.toRegistrationResponse(savedClub);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_FACULTY')")
    @Transactional(rollbackFor = Exception.class)
    public ClubResponse suspendClubBySlug(String slug) {
        log.debug("Attempting to suspend club with slug: {}", slug);

        Club club = clubRepository.findBySlug(slug)
                .orElseThrow(() -> {
                    log.warn("Suspension failed: Club not found with slug: {}", slug);
                    return new EntityNotFoundException("Club not found.");
                });

        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        log.debug("Suspension requested by {} for club: '{}' (current status: {})",
                currentUser.getEmail(), club.getName(), club.getClubStatus());

        if (club.getClubStatus() == ClubStatus.SUSPENDED) {
            log.warn("Suspension failed: Club '{}' (slug: {}) is already suspended", club.getName(), slug);
            throw new IllegalArgumentException("Club is already suspended");
        }

        // Only allow suspension of ACTIVE clubs
        if (club.getClubStatus() != ClubStatus.ACTIVE) {
            log.warn("Suspension failed: Club '{}' (slug: {}) has status {} - only ACTIVE clubs can be suspended",
                    club.getName(), slug, club.getClubStatus());
            throw new IllegalStateException("Only active clubs can be suspended");
        }

        club.setClubStatus(ClubStatus.SUSPENDED);
        Club savedClub = clubRepository.save(club);

        log.info("Successfully suspended club: '{}' (slug: {}, ID: {}) by {}",
                savedClub.getName(), slug, savedClub.getId(), currentUser.getEmail());

        // TODO: Consider hiding club events and notifying members

        return clubMapper.toRegistrationResponse(savedClub);
    }
}