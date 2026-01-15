package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.dto.events.EventRegistrationSummary;
import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventRegistration;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {

    boolean existsByEventAndUserAndStatus(Event event, User user, EventRegistrationStatus status);

    Optional<EventRegistration> findByEventAndUser(Event event, User user);

    Page<EventRegistration> findByEventAndStatus(Event event, EventRegistrationStatus status, Pageable pageable);

    Page<EventRegistration> findEventRegistrationByUser(User user, Pageable pageable);

    Page<EventRegistration> findEventRegistrationByUserAndStatus(User user, EventRegistrationStatus status, Pageable pageable);

    Optional<EventRegistration> findByUserAndEvent(User user, Event event);
}
