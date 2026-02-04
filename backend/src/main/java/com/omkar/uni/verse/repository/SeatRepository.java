package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.events.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeatRepository extends JpaRepository<Seat, Long> {
}