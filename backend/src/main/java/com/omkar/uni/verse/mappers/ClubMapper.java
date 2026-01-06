package com.omkar.uni.verse.mappers;

import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubRegistrationRequest;
import com.omkar.uni.verse.domain.dto.clubs.ClubRegistrationResponse;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClubMapper {

    Club toEntity(ClubRegistrationRequest registrationRequest);

    ClubRegistrationResponse toRegistrationResponse(Club club);

    ClubDTO toClubDTO(Club club);

}
