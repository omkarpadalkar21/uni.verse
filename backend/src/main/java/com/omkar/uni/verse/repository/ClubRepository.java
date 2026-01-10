package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ClubRepository extends JpaRepository<Club, UUID> {
    boolean existsBySlug(String slug);

    Page<Club> findAllByClubStatus(ClubStatus clubStatus, Pageable pageable);

    Optional<Club> findBySlugAndClubStatus(String slug, ClubStatus clubStatus);

    Optional<Club> findBySlug(String slug);

    @Modifying
    @Query("UPDATE Club c SET c.memberCount = c.memberCount - 1 WHERE c.id = :id")
    void decrementMemberCount(UUID id);
}