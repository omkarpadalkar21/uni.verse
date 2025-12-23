package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.user.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
}