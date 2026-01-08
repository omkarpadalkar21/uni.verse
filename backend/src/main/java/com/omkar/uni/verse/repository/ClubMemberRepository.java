package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ClubMemberRepository extends JpaRepository<ClubMember, UUID> {
    
    List<ClubMember> findByClubAndLeftAtIsNull(Club club);
}