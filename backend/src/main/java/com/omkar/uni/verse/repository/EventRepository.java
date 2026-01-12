package com.omkar.uni.verse.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventCategory;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import jdk.jfr.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    Page<Event> findAllByClubAndCategoryAndEndTimeIsAfterAndCancelledAtIsNullAndStatus(Club club, EventCategory category, LocalDateTime time, EventStatus status, Pageable pageable);

    Page<Event> findAllByStatus(EventStatus eventStatus, Pageable pageable);

    Optional<Event> findById(UUID id);
}