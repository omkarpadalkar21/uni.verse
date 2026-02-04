package com.omkar.uni.verse.domain.entities.events;

import com.omkar.uni.verse.domain.entities.booking.Booking;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.redis.core.StringRedisTemplate;

@Entity
@Table(
        name = "booking_seats",
        indexes = {
                @Index(name = "idx_booking_seats_booking_id", columnList = "booking_id"),
                @Index(name = "idx_booking_seats_event_seat_id", columnList = "event_seat_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSeat {

    @EmbeddedId
    private BookingSeatId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("bookingId")
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventSeatId")
    @JoinColumn(name = "event_seat_id", nullable = false)
    private EventSeats eventSeat;

}
