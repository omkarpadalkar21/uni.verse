package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubMember;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClubMemberRepository extends JpaRepository<ClubMember, UUID> {
    
    List<ClubMember> findByClubAndLeftAtIsNull(Club club);

    boolean existsByUserAndClubAndLeftAtIsNull(User userRequestingToJoinClub, Club club);

    Optional<ClubMember> findByUserAndClubAndLeftAtIsNull(User user, Club club);

    void removeClubMemberById(UUID id);

    Optional<ClubMember> findByUser(User userToBePromoted);
}