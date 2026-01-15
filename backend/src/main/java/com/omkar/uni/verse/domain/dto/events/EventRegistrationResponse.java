package com.omkar.uni.verse.domain.dto.events;


import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EventRegistrationResponse {
    private EventRegistrationStatus registrationStatus;
    private String rejectionReason;

}
