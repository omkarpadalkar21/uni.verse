package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.OrganizerVerification;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrganizerVerificationRepository extends JpaRepository<OrganizerVerification, UUID> {
}