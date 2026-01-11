package com.omkar.uni.verse.domain.dto.clubs;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubSummary {
    private UUID id;
    private String name;
    private String slug;
    private String logoUrl;
}
