package com.omkar.uni.verse.domain.entities.user;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public enum RoleName {
    USER(0),
    CLUB_MEMBER(1),
    CLUB_LEADER(2),
    FACULTY(3),
    SUPERADMIN(4);

    private final int level;

    RoleName(int level) {
        this.level = level;
    }

    // Get all inherited authorities for Spring Security
    public List<GrantedAuthority> getInheritedAuthorities() {
        return Arrays.stream(RoleName.values())
                .filter(role -> role.level <= this.level)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }
}
