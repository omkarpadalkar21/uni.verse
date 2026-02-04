package com.omkar.uni.verse.domain.dto.events;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueSummary {
    private Integer id;
    private String name;
    private String location;
    private Map<String, String> seatLayout = new HashMap<>();
}
