package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.AuthenticationResponse;
import com.omkar.uni.verse.domain.dto.RegistrationRequest;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.repository.RoleRepository;
import com.omkar.uni.verse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationResponse register(RegistrationRequest registrationRequest) {
        var userRole = roleRepository.findByName(RoleName.USER).orElseThrow(() -> new IllegalStateException("Role USER was not initialized"));

        User newUser = User.builder()
                .email(registrationRequest.getEmail())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .phone(registrationRequest.getPhone())
                .universityId(registrationRequest.getUniversityId())
                .universityEmailDomain("@muj.manipal.edu") // currently support for only 1 university
                // first name and last name are null, update them later
                .build();

        userRepository.save(newUser);
        sendVerificationEmail(newUser);
        String newAccessToken = jwtService.generateAccessToken(newUser);
        String newRefreshToken = jwtService.generateRefreshToken(newUser);

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    private void sendVerificationEmail(User newUser) {
    }
}
