package com.omkar.uni.verse.domain.dto.user;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class UserBasicDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String universityId;
    private String phone;
    private com.omkar.uni.verse.domain.entities.user.AccountStatus accountStatus;
    private java.util.List<String> roles;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime lastLogin;
}
