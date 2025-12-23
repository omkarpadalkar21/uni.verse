package com.omkar.uni.verse.domain.entities.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Formula;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_full_name", columnList = "full_name"),
        @Index(name = "idx_users_university_id", columnList = "university_id"),
        @Index(name = "idx_users_account_status", columnList = "account_status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    // Name fields
    @Size(min = 2, max = 125, message = "First name must be between {min} and {max} characters")
    @Column(name = "first_name", length = 125)
    private String firstName;

    @Size(min = 2, max = 125, message = "Last name must be between {min} and {max} characters")
    @Column(name = "last_name", length = 125)
    private String lastName;

    @Formula("(TRIM(first_name || ' ' || last_name))")
    @Column(name = "full_name", insertable = false, updatable = false)
    private String fullName;

    // Authentication
    @Email(message = "Invalid email format")
    @Size(max = 255)
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false)
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    // University
    @Column(name = "university_id", length = 25, nullable = false)
    private String universityId;

    @Column(name = "university_email_domain", length = 100, nullable = false)
    private String universityEmailDomain;

    // Verification
    @Builder.Default
    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    // Account status
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "account_status", length = 20, nullable = false)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(name = "suspension_reason", columnDefinition = "TEXT")
    private String suspensionReason;

    @Column(name = "suspended_at")
    private LocalDateTime suspendedAt;

    // Profile
    @Column(length = 20, nullable = false)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    // Timestamps - Auto-managed ✅
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // Foreign key for self-reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suspended_by_user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User suspendedBy;

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserRole> userRoles = new HashSet<>();

    @Transient
    public Set<RoleName> getRoles() {
        return userRoles.stream()
                .map(userRole -> userRole.getRole().getName())
                .collect(Collectors.toSet());
    }

    @Transient
    public boolean hasRole(RoleName roleName) {
        return userRoles.stream()
                .anyMatch(userRole -> userRole.getRole().getName() == roleName);
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security expects authorities prefixed with ROLE_ for role-based security to work with hasRole() and @PreAuthorize("hasRole('USER')").
        return userRoles.stream()
                .map(userRole -> new SimpleGrantedAuthority("ROLE_" + userRole.getRole().getName().name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return !(accountStatus == AccountStatus.DELETED);
    }

    @Override
    public boolean isAccountNonLocked() {
        return !(accountStatus == AccountStatus.SUSPENDED);
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == AccountStatus.ACTIVE && emailVerified;
    }
}
