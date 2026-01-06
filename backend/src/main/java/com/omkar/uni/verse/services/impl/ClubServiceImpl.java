package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.clubs.*;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.mappers.ClubMapper;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.services.ClubService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClubServiceImpl implements ClubService {

    private final ClubRepository clubRepository;
    private final ClubMapper clubMapper;

    @Override
    @PreAuthorize("hasRole('CLUB_LEADER')")
    public ClubRegistrationResponse registerNewClub(ClubRegistrationRequest registrationRequest) {
        // Get the current authenticated user
        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // Check if club slug already exists (optional but recommended validation)
        if (clubRepository.existsBySlug(registrationRequest.getSlug())) {
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


        // Save the entity and map to response
        return clubMapper.toRegistrationResponse(clubRepository.save(club));
    }

    @Override
    public Page<ClubDTO> getAllClubs(int offset, int pageSize) {
        return clubRepository.findAllByClubStatus(ClubStatus.ACTIVE, PageRequest.of(offset, pageSize))
                .map(clubMapper::toClubDTO);
    }

    @Override
    public ClubDTO getClubBySlug(String slug) {
        return clubMapper.toClubDTO(clubRepository.findBySlugAndClubStatus(slug, ClubStatus.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Club not found.")));
    }

    @Override
    @PreAuthorize("hasRole('CLUB_LEADER')")
    public ClubDTO updateClubBySlug(String slug, ClubUpdateRequest clubUpdateRequest) {
        Club club = clubRepository.findBySlugAndClubStatus(slug, ClubStatus.ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Club not found or not activated!"));

        User currentUser = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        if (club.getLeaders().stream().anyMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            throw new AccessDeniedException("You are not authorized to update this club!");
        }

        club.setName(clubUpdateRequest.getName());
        club.setDescription(clubUpdateRequest.getDescription());
        club.setLogoUrl(clubUpdateRequest.getLogoUrl());
        club.setSocialLinks(clubUpdateRequest.getSocialLinks());

        return clubMapper.toClubDTO(club);
    }

    @Override
    public ClubRegistrationResponse approveClubBySlug(String slug) {
        return null;
    }

    @Override
    public ClubRejectionResponse rejectClubBySLug(String slug) {
        return null;
    }

    @Override
    public ClubSuspensionResponse suspendClubBySLug(String slug) {
        return null;
    }
}
