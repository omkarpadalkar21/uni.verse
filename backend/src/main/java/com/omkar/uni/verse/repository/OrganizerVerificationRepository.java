package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.clubs.OrganizerVerification;
import com.omkar.uni.verse.domain.entities.clubs.VerificationStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrganizerVerificationRepository extends JpaRepository<OrganizerVerification, UUID> {
    Optional<OrganizerVerification> findByUser(User user);

    Optional<OrganizerVerification> findById(UUID id);

    Page<OrganizerVerification> getAllByStatus(VerificationStatus status, Pageable pageable);
}