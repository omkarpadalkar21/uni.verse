package com.omkar.uni.verse.services;

import com.omkar.uni.verse.repository.EmailVerificationTokenRepository;
import com.omkar.uni.verse.repository.OrganizerVerificationTokenRepository;
import com.omkar.uni.verse.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final OrganizerVerificationTokenRepository organizerVerificationTokenRepository;

    @Scheduled(cron = "0 0 2 * * ?")  // Run daily at 2 AM
    public void cleanupExpiredTokens() {
        emailVerificationTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        passwordResetTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        organizerVerificationTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
