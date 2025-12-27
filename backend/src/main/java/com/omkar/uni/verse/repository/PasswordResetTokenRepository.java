package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.user.PasswordResetToken;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByUserAndToken(User user, String hashedToken);

    void deleteByUserAndUsedAtIsNull(User user);

    void deleteByExpiresAtBefore(LocalDateTime now);

    Optional<PasswordResetToken> findTopByUserOrderByCreatedAtDesc(User user);
}