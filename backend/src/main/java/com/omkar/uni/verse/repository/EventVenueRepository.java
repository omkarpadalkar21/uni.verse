package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.dto.events.VenueSummary;
import com.omkar.uni.verse.domain.entities.events.EventVenue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventVenueRepository extends JpaRepository<EventVenue, Integer> {
    Optional<EventVenue> findById(Integer id);

    Page<EventVenue> getAll(Pageable pageable);
}