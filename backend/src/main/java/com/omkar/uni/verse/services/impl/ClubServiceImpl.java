package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubRegistrationRequest;
import com.omkar.uni.verse.domain.dto.clubs.ClubRegistrationResponse;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import com.omkar.uni.verse.mappers.ClubMapper;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.services.ClubService;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;

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
        return clubRepository.findAll(PageRequest.of(offset, pageSize)).map(clubMapper::toClubDTO);
    }
}
