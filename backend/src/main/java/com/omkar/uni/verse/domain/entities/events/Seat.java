package com.omkar.uni.verse.domain.entities.events;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "seats",
        indexes = {
                @Index(name = "idx_seats_venue_id", columnList = "venue_id"),
                @Index(name = "idx_seats_type", columnList = "seat_type")
        },
        uniqueConstraints = @UniqueConstraint(columnNames = {"venue_id", "section", "row_label", "seat_number"})
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private EventVenue venue;

    // Seat identification
    @Column(length = 10)
    private String section;

    @Column(name = "row_label", length = 10)
    private String rowLabel;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    // Seat properties
    @Column(name = "seat_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SeatType seatType = SeatType.REGULAR;


}
