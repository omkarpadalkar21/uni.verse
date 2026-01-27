package com.omkar.uni.verse.mappers;

import com.omkar.uni.verse.domain.dto.admin.OrganizerVerificationResponse;
import com.omkar.uni.verse.domain.entities.clubs.OrganizerVerification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizerVerificationMapper {
    @Mapping(target = "userEmail", source ="user.email" )
    @Mapping(target = "reviewByName", source = "reviewedBy.firstName")
    @Mapping(target = "reviewedByEmail", source = "reviewedBy.email")
    OrganizerVerificationResponse toOrganizerVerificationResponse(OrganizerVerification verification);


}
