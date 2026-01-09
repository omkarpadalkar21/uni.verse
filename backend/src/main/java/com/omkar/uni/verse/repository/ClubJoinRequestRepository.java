package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubJoinRequest;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ClubJoinRequestRepository extends JpaRepository<ClubJoinRequest, UUID> {
    boolean existsClubJoinRequestByUserAndClub(User user, Club club);

    Page<ClubJoinRequest> findClubJoinRequestByClub(Club club, Pageable pageable);

    Optional<ClubJoinRequest> findClubJoinRequestByUserAndClub(User user, Club club);
}