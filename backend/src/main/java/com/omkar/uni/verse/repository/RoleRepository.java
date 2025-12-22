package com.omkar.uni.verse.repository;

import com.omkar.uni.verse.domain.entities.user.Role;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(RoleName name);
}