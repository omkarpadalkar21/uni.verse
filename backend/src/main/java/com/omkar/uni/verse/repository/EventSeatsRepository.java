package com.omkar.uni.verse.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventSeats;
import org.springframework.data.repository.query.Param;


public interface EventSeatsRepository extends JpaRepository<EventSeats, Long> {
    @Query("SELECT es from EventSeats es left join fetch es.seat where es.event = :event")
    List<EventSeats> findByEventWithSeats(@Param("event") Event event);

    @Query("SELECT COUNT(es) FROM EventSeats es WHERE es.event.id = :eventId AND es.status = 'BOOKED'")
    Long countBookedSeatsByEventId(@Param("eventId") UUID eventId);

}