package com.omkar.uni.verse.domain.entities.events;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingSeatId implements Serializable {
    private Long bookingId;
    private Long eventSeatId;
}
