package com.omkar.uni.verse.services;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import com.omkar.uni.verse.domain.dto.*;
import com.omkar.uni.verse.domain.entities.user.*;
import com.omkar.uni.verse.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.omkar.uni.verse.repository.EmailVerificationTokenRepository;
import com.omkar.uni.verse.repository.RoleRepository;
import com.omkar.uni.verse.repository.UserRepository;

import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;

    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${spring.mail.username}")
    private String platformMailId;

    @Transactional
    public RegistrationResponse register(RegistrationRequest registrationRequest) throws MessagingException {
        if (userRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }

        String email = registrationRequest.getEmail();
        String expectedDomain = "@muj.manipal.edu";

        if (!email.endsWith(expectedDomain)) {
            throw new IllegalArgumentException("Only MUJ email addresses are allowed");
        }

        var userRole = roleRepository.findByName(RoleName.USER).orElseThrow(() -> new IllegalStateException("Role USER was not initialized"));

        User newUser = User.builder()
                .email(registrationRequest.getEmail())
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .phone(registrationRequest.getPhone())
                .universityId(registrationRequest.getUniversityId())
                .universityEmailDomain("@muj.manipal.edu") // currently support for only 1 university
                // first name and last name are null, update them later
                .build();

        UserRole userRoleAssociation = new UserRole(newUser, userRole);
        newUser.getUserRoles().add(userRoleAssociation);
        userRepository.save(newUser);

        return RegistrationResponse.builder()
                .message("Registration successful. Please verify your email")
                .email(newUser.getEmail())
                .build();
    }

    @Transactional
    public AuthenticationResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        EmailVerificationToken token = emailVerificationTokenRepository.findByUserAndOtp(user, request.getOtp())
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP"));

        if (token.getVerifiedAt() != null) {
            throw new IllegalArgumentException("OTP already used");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired. Request a new one.");
        }

        token.setVerifiedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(token);

        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);

        String newRefreshToken = jwtService.generateRefreshToken(user);
        String newAccessToken = jwtService.generateAccessToken(user);
        return AuthenticationResponse.builder()
                .refreshToken(newRefreshToken)
                .accessToken(newAccessToken)
                .build();
    }

    public AuthenticationResponse login(LoginRequest request) {
        var auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
        ));

        User user = (User) auth.getPrincipal();
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    public void sendPasswordResetEmail(ForgotPasswordRequest request) throws MessagingException {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = generateAndSavePasswordResetToken(user);
        emailService.sendEmail(
                platformMailId,
                user.getEmail(),
                "Reset Password for UniVerse",
                token,
                EmailTemplateName.FORGOT_PASSWORD
        );
    }

    private String generateAndSavePasswordResetToken(User user) {
        String generatedToken = generateToken(8);
        var token = PasswordResetToken.builder()
                .user(user)
                .token(generatedToken)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .usedAt(LocalDateTime.now())
                .build();
        passwordResetTokenRepository.save(token);
        return generatedToken;
    }

    public void sendVerificationEmail(String email) throws MessagingException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        sendVerificationEmail(user);
    }

    private void sendVerificationEmail(User user) throws MessagingException, IllegalStateException {
        Optional<EmailVerificationToken> recentToken = emailVerificationTokenRepository.findTopByUserOrderByCreatedAtDesc(user);

        // Check if the user has recently generated a token preventing spam requests
        if (recentToken.isPresent() && recentToken.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(2))) {
            throw new IllegalStateException("Please wait before requesting a new OTP");
        }
        String newToken = generateAndSaveActivationToken(user);
        emailService.sendEmail(
                platformMailId,
                user.getEmail(),
                "OTP Verification from UniVerse",
                newToken,
                EmailTemplateName.VERIFY_ACCOUNT
        );
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateToken(8);
        var token = EmailVerificationToken.builder()
                .user(user)
                .otp(generatedToken)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        emailVerificationTokenRepository.save(token);
        return generatedToken;
    }

    private String generateToken(int length) {
        String characters = "0123456789";  // ✅ Alphanumeric
        SecureRandom secureRandom = new SecureRandom();

        return secureRandom.ints(length, 0, characters.length())
                .mapToObj(characters::charAt)
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
    }
}
