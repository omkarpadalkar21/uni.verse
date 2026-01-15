package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.dto.user.UserBasicDTO;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class EventRegistrationSummary {
    private EventSummary eventSummary;
    private String clubName;
    private UserBasicDTO user;  
    private String userEmail;   
    private LocalDateTime registeredAt;
    private EventRegistrationStatus registrationStatus;
}
