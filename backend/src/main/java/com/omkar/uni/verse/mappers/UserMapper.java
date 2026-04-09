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

    @Mapping(target = "status", source = "accountStatus")
    @Mapping(target = "joinedClub", ignore = true)
    UserProfileResponse toUserProfileResponse(User user);

    @Mapping(target = "roles", expression = "java(java.util.Collections.singletonList(user.getRole().name()))")
    @Mapping(target = "lastLogin", source = "lastLoginAt")
    UserBasicDTO toUserBasicDto(User user);
}
