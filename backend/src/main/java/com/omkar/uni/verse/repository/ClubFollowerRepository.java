package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.clubs.ClubFollower;
import com.omkar.uni.verse.domain.entities.clubs.ClubFollowerId;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface ClubFollowerRepository extends JpaRepository<ClubFollower, ClubFollowerId> {
    Optional<Set<ClubFollower>> findClubFollowerByUser(User user);
}