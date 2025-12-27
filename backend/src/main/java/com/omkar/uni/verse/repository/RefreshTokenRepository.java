package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.user.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenAndRevokedAtIsNull(String token);

}