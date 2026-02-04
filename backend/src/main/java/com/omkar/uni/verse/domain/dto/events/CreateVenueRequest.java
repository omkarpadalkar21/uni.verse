package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.events.VenueType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVenueRequest {
    private String name;
    private VenueType type;
    private Integer capacity;
    private Map<String, String> seatLayout;
    private String location;
    private String description;
}
