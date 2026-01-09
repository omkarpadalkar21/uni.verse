package com.omkar.uni.verse.config;

import com.omkar.uni.verse.domain.entities.user.AccountStatus;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class DataSeederConfig {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedTestUsers() {
        return args -> {
            log.info("Starting test user data seeding...");

            // Check if users already exist to avoid duplicates
            if (userRepository.findByEmail("user@jaipur.manipal.edu").isPresent()) {
                log.info("Test users already exist. Skipping seeding.");
                return;
            }

            List<User> testUsers = List.of(
                    createUser(
                            "John",
                            "Doe",
                            "user@muj.manipal.edu",
                            "USER001",
                            "+919876543210",
                            "Regular user account for testing purposes",
                            RoleName.USER
                    ),
                    createUser(
                            "Alice",
                            "Smith",
                            "clubmember@muj.manipal.edu",
                            "CLM001",
                            "+919876543211",
                            "Club member account with access to club features",
                            RoleName.CLUB_MEMBER
                    ),
                    createUser(
                            "Bob",
                            "Johnson",
                            "clubleader@muj.manipal.edu",
                            "CLL001",
                            "+919876543212",
                            "Club leader account with club management privileges",
                            RoleName.CLUB_LEADER
                    ),
                    createUser(
                            "Dr. Emma",
                            "Wilson",
                            "faculty@muj.manipal.edu",
                            "FAC001",
                            "+919876543213",
                            "Faculty account with administrative privileges",
                            RoleName.FACULTY
                    ),
                    createUser(
                            "Admin",
                            "SuperUser",
                            "superadmin@muj.manipal.edu",
                            "ADM001",
                            "+919876543214",
                            "Super admin account with full system access",
                            RoleName.SUPERADMIN
                    )
            );

            userRepository.saveAll(testUsers);
            log.info("Successfully seeded {} test users", testUsers.size());

            testUsers.forEach(user ->
                    log.info("Created user: {} ({}) with role: {}",
                            user.getEmail(), user.getFullName(), user.getRole())
            );
        };
    }

    private User createUser(
            String firstName,
            String lastName,
            String email,
            String universityId,
            String phone,
            String bio,
            RoleName role
    ) {
        LocalDateTime now = LocalDateTime.now();

        return User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .password(passwordEncoder.encode("Test@123")) // Same password for all test users
                .universityId(universityId)
                .universityEmailDomain("@muj.manipal.edu")
                .emailVerified(true)
                .emailVerifiedAt(now)
                .accountStatus(AccountStatus.ACTIVE)
                .phone(phone)
                .bio(bio)
                .avatarUrl(null)
                .createdAt(now)
                .updatedAt(now)
                .lastLoginAt(null)
                .suspensionReason(null)
                .suspendedAt(null)
                .suspendedBy(null)
                .role(role)
                .build();
    }
}
