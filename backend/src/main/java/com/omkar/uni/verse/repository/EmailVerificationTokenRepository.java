package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.user.EmailVerificationToken;
import com.omkar.uni.verse.domain.entities.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findTopByUserOrderByCreatedAtDesc(User user);

    void deleteByExpiresAtBefore(LocalDateTime expiresAtBefore);

    Optional<EmailVerificationToken> findByUserAndOtp(User user, String otp);

    void deleteByUserAndVerifiedAtIsNull(User user);
}