package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventRegistration;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {
    
    /**
     * Check if a user is registered for an event with APPROVED status
     * @param event The event
     * @param user The user
     * @param status The registration status
     * @return true if registration exists with the given status
     */
    boolean existsByEventAndUserAndStatus(Event event, User user, EventRegistrationStatus status);
    
    /**
     * Find a registration by event and user
     * @param event The event
     * @param user The user
     * @return Optional containing the registration if found
     */
    Optional<EventRegistration> findByEventAndUser(Event event, User user);
}
