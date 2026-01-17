package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.user.AccountStatus;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.domain.entities.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findById(UUID id);

    Page<User> findAllByAccountStatusAndRole(AccountStatus accountStatus, RoleName role, Pageable pageable);
    
    Page<User> findAllByAccountStatus(AccountStatus accountStatus, Pageable pageable);
    
    Page<User> findAllByRole(RoleName role, Pageable pageable);

    long countUsersByAccountStatus(AccountStatus accountStatus);
}