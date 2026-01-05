package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubRegistrationRequest;
import com.omkar.uni.verse.domain.dto.clubs.ClubRegistrationResponse;
import org.springframework.data.domain.Page;

public interface ClubService {
    ClubRegistrationResponse registerNewClub(ClubRegistrationRequest registrationRequest);

    Page<ClubDTO> getAllClubs(int offset, int pageSize);

}
