package com.omkar.uni.verse.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventCategory;
import com.omkar.uni.verse.domain.entities.events.EventStatus;

public interface EventRepository extends JpaRepository<Event, UUID> {
    Page<Event> findAllByClubAndCategoryAndEndTimeIsAfterAndCancelledAtIsNullAndStatus(Club club, EventCategory category, LocalDateTime time, EventStatus status, Pageable pageable);

    Page<Event> findAllByStatus(EventStatus eventStatus, Pageable pageable);

    Optional<Event> findByIdAndStatus(UUID id, EventStatus status);

    List<Event> findByStatusAndEndTimeBefore(EventStatus status, LocalDateTime endTime);

    long countEventByStatus(EventStatus status);
}