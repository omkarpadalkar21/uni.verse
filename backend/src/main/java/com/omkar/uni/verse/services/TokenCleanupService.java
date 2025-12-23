package com.omkar.uni.verse.services;

import com.omkar.uni.verse.repository.EmailVerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenCleanupService {

    private final EmailVerificationTokenRepository tokenRepository;

    @Scheduled(cron = "0 0 2 * * ?")  // Run daily at 2 AM
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
