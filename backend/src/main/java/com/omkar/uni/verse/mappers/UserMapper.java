package com.omkar.uni.verse.mappers;

import com.omkar.uni.verse.domain.dto.RegistrationRequest;
import com.omkar.uni.verse.domain.dto.user.UserBasicDTO;
import com.omkar.uni.verse.domain.dto.user.UserProfileResponse;
import com.omkar.uni.verse.domain.entities.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "password", source = "password", ignore = true)
    User toEntity(RegistrationRequest registrationRequest);

    UserProfileResponse toUserProfileResponse(User user);

    UserBasicDTO toUserBasicDto(User user);
}
