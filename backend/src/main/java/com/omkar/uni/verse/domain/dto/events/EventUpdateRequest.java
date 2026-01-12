package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.events.EventRegistrationMode;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EventUpdateRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeValid() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return endTime.isAfter(startTime);
    }

    @NotNull
    private Integer capacity;

    @AssertTrue(message = "Capacity should be greater than 0")
    public boolean isCapacityValid() {
        return capacity > 0;
    }

    @NotNull
    private EventRegistrationMode registrationMode;
}
