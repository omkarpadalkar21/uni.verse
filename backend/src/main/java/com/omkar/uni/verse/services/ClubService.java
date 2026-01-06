package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.clubs.*;
import org.springframework.data.domain.Page;

public interface ClubService {
    ClubResponse registerNewClub(ClubRegistrationRequest registrationRequest);

    Page<ClubDTO> getAllClubs(int offset, int pageSize);

    ClubDTO getClubBySlug(String slug);

    ClubDTO updateClubBySlug(String slug, ClubUpdateRequest clubUpdateRequest);

    ClubResponse approveClubBySlug(String slug);

    ClubResponse rejectClubBySlug(String slug);

    ClubResponse suspendClubBySlug(String slug);

}
