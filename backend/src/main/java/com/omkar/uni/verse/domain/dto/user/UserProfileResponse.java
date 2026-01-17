package com.omkar.uni.verse.domain.dto.user;

import com.omkar.uni.verse.domain.entities.user.AccountStatus;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Setter
@Getter
@Builder
public class UserProfileResponse {
    //    id, name, email, role, universityId, joinedClubs[]
    private UUID id;
    private String firstName;
    private String lastName;
    private RoleName role;
    private AccountStatus status;
    private String universityId;
    private Set<String> joinedClub;
}
