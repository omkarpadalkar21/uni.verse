package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.OrganizerVerificationToken;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface OrganizerVerificationTokenRepository extends JpaRepository<OrganizerVerificationToken, UUID> {
    void deleteByUserAndVerifiedAtIsNull(User user);

    void deleteByExpiresAtBefore(LocalDateTime now);

    Optional<OrganizerVerificationToken> findByUserAndOtp(User user, String otp);
}