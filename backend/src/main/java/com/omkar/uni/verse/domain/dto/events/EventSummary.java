package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.events.EventCategory;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.domain.entities.events.EventVenue;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class EventSummary {
    private UUID id;
    private String clubName;
    private String title;
    private String slug;
    private String description;
    private EventVenue venue;
    private Integer capacity;
    private String bannerUrl;
    private String thumbnailUrl;
    private EventCategory category;
    private String[] tags;
    private EventStatus status;
}
