package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.user.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
}