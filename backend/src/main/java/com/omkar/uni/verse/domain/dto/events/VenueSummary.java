package com.omkar.uni.verse.domain.dto.events;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueSummary {
    private Integer id;
    private String name;
    private String location;
}
