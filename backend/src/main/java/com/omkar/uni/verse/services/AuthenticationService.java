package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.AuthenticationResponse;
import com.omkar.uni.verse.domain.dto.RegistrationRequest;
import com.omkar.uni.verse.domain.entities.user.EmailVerificationToken;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.repository.EmailVerificationTokenRepository;
import com.omkar.uni.verse.repository.RoleRepository;
import com.omkar.uni.verse.repository.UserRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import static org.springframework.security.crypto.keygen.KeyGenerators.secureRandom;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository tokenRepository;

    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${spring.mail.username}")
    private String platformMailId;

    public AuthenticationResponse register(RegistrationRequest registrationRequest) throws MessagingException {
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

    private void sendVerificationEmail(User user) throws MessagingException {
        String newToken = generateAndSaveActivationToken(user);
        emailService.sendVerificationEmail(
                platformMailId,
                user.getEmail(),
                "OTP Verification from UniVerse",
                newToken
        );
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(6);
        var token = EmailVerificationToken.builder()
                .user(user)
                .otp(generatedToken)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationCode(int length) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom secureRandom = new SecureRandom();
        for (int i = 0; i < length; i++) {
            int index = secureRandom.nextInt(characters.length());
            codeBuilder.append(characters.charAt(index));
        }
        return codeBuilder.toString();
    }
}
