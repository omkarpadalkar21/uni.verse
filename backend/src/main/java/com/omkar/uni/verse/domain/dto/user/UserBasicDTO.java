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
}
