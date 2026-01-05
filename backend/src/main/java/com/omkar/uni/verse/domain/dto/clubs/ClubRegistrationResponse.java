package com.omkar.uni.verse.domain.dto.clubs;

import com.omkar.uni.verse.domain.entities.clubs.ClubCategory;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
public class ClubRegistrationResponse {
    private String name;

    private String slug;

    private String description;

    private ClubCategory clubCategory;

    private String[] tags;

    private String logoUrl;

    private String bannerUrl;

    private Map<String, String> socialLinks;

    private ClubStatus clubStatus;
}
