package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubLeader;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClubLeaderRepository extends JpaRepository<ClubLeader, UUID> {
    
    List<ClubLeader> findByClub(Club club);
}
