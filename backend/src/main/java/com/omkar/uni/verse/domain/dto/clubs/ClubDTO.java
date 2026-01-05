package com.omkar.uni.verse.domain.dto.clubs;

import com.omkar.uni.verse.domain.entities.clubs.ClubCategory;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubDTO {
    private String name;
    private String slug;
    private String description;
    private ClubCategory clubCategory;
    private String[] tags;
    private String logoUrl;
    private String bannerUrl;
    private Integer memberCount;
    private Integer followerCount;
    private Integer eventCount;
}
