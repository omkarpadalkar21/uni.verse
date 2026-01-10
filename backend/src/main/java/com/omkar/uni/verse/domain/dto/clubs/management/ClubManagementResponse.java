package com.omkar.uni.verse.domain.dto.clubs.management;

import com.omkar.uni.verse.domain.entities.clubs.ClubRole;

public record ClubManagementResponse(String message, ClubRole role) {
}
