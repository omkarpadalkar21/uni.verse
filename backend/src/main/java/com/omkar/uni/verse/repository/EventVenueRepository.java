package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.events.EventVenue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventVenueRepository extends JpaRepository<EventVenue, Integer> {
    Optional<EventVenue> findById(Integer id);
}