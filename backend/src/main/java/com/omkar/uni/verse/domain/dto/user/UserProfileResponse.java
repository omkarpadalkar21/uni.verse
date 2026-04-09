package com.omkar.uni.verse.domain.dto.user;

import com.omkar.uni.verse.domain.entities.user.AccountStatus;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Setter
@Getter
@Builder
public class UserProfileResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String universityId;
    private RoleName role;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private Set<String> joinedClub;
}
