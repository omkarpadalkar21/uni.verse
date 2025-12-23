package com.omkar.uni.verse;

import com.omkar.uni.verse.domain.entities.user.Role;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.repository.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.Arrays;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableScheduling // for cron jobs
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    @Transactional
    CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            Arrays.stream(RoleName.values())
                    .filter(roleName -> !roleRepository.existsByName(roleName))
                    .forEach(roleName -> {
                        Role role = Role.builder()
                                .name(roleName)
                                .build();
                        roleRepository.save(role);
                        System.out.println("Created role: " + roleName);
                    });
        };
    }
}
