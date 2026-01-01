package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.*;
import com.omkar.uni.verse.domain.entities.user.*;
import com.omkar.uni.verse.repository.EmailVerificationTokenRepository;
import com.omkar.uni.verse.repository.PasswordResetTokenRepository;
import com.omkar.uni.verse.repository.RefreshTokenRepository;
import com.omkar.uni.verse.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistService tokenBlacklistService;

    @Value("${spring.mail.username}")
    private String platformMailId;

    private static final String EXPECTED_DOMAIN = "@muj.manipal.edu";

    @Transactional
    public RegistrationResponse register(RegistrationRequest registrationRequest) throws MessagingException {
        log.info("Registration attempt for email: {}", registrationRequest.getEmail());

        String email = registrationRequest.getEmail();

        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            log.warn("Registration failed - email already exists: {}", email);
            throw new IllegalArgumentException("Registration failed. Please check your details.");
        }

        // Check if the provided email is a valid university email
        if (!email.endsWith(EXPECTED_DOMAIN)) {
            log.warn("Registration failed - invalid email domain: {}", email);
            throw new IllegalArgumentException("Only MUJ email addresses are allowed");
        }

//        var userRole = roleRepository.findByName(RoleName.USER)
//                .orElseThrow(() -> new IllegalStateException("Role USER was not initialized"));

        User newUser = User.builder()
                .email(email)
                .password(passwordEncoder.encode(registrationRequest.getPassword()))
                .phone(registrationRequest.getPhone())
                .universityId(registrationRequest.getUniversityId())
                .universityEmailDomain(EXPECTED_DOMAIN)
                .build();

//        UserRole userRoleAssociation = new UserRole(newUser, userRole);
//        newUser.getUserRoles().add(userRoleAssociation);
        userRepository.save(newUser);

        log.info("User registered successfully: {}", email);

//        // Send verification email
//        sendEmail(newUser, EmailTemplateName.VERIFY_ACCOUNT);

        return RegistrationResponse.builder()
                .message("Registration successful. Please verify your email")
                .email(newUser.getEmail())
                .build();
    }

    @Transactional
    public AuthenticationResponse verifyEmail(VerifyEmailRequest request, String ipAddress, String userAgent) {
        log.info("Email verification attempt for: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("Verification failed - user not found: {}", request.getEmail());
                    return new UsernameNotFoundException("User not found");
                });

        String hashedOtp = hashToken(request.getOtp());

        EmailVerificationToken token = emailVerificationTokenRepository.findByUserAndOtp(user, hashedOtp)
                .orElseThrow(() -> {
                    log.warn("Invalid OTP attempt for user: {}", user.getEmail());
                    return new IllegalArgumentException("Invalid OTP");
                });

        // Check if token already used
        if (token.getVerifiedAt() != null) {
            log.warn("OTP reuse attempt for user: {}", user.getEmail());
            throw new IllegalArgumentException("OTP already used");
        }

        // Check if token expired
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Expired OTP attempt for user: {}", user.getEmail());
            throw new IllegalArgumentException("OTP has expired. Request a new one.");
        }

        // Mark token as verified
        token.setVerifiedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(token);

        // Verify user email
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Email verified successfully for user: {}", user.getEmail());

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user, ipAddress, userAgent);

        return AuthenticationResponse.builder()
                .refreshToken(newRefreshToken)
                .accessToken(newAccessToken)
                .build();
    }

    public AuthenticationResponse login(LoginRequest request, String ipAddress, String userAgent) {
        log.info("Login attempt for email: {}", request.getEmail());

        var auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
        ));

        User user = (User) auth.getPrincipal();
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User logged in successfully: {}", user.getEmail());

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user, ipAddress, userAgent);

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    // STEP 1: Request password reset (forgot password)
    public void sendPasswordResetEmail(ForgotPasswordRequest request, String ipAddress) throws MessagingException {
        log.info("Password reset request for email: {}", request.getEmail());

        // Generic response to prevent email enumeration
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
            // Don't throw exception - return silently to prevent enumeration
            return;
        }

        User user = userOpt.get();

        // Send password reset email (includes rate limiting)
        sendEmail(user, EmailTemplateName.FORGOT_PASSWORD, ipAddress);

        log.info("Password reset email sent to: {}", user.getEmail());
    }

    // STEP 2: Actually reset the password with token
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("Password reset failed - user not found: {}", request.getEmail());
                    return new UsernameNotFoundException("User not found");
                });

        String hashedToken = hashToken(request.getToken());

        PasswordResetToken token = passwordResetTokenRepository.findByUserAndToken(user, hashedToken)
                .orElseThrow(() -> {
                    log.warn("Invalid password reset token for user: {}", user.getEmail());
                    return new IllegalArgumentException("Invalid reset token");
                });

        // Check if token already used
        if (token.getUsedAt() != null) {
            log.warn("Password reset token reuse attempt for user: {}", user.getEmail());
            throw new IllegalArgumentException("Reset token already used");
        }

        // Check if token expired
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Expired password reset token for user: {}", user.getEmail());
            throw new IllegalArgumentException("Reset token has expired. Request a new one.");
        }

        // Mark token as used
        token.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(token);

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password reset successfully for user: {}", user.getEmail());

        // TODO: Invalidate all existing JWT tokens for this user
        // This requires JWT blacklisting or token versioning implementation
    }

    @Transactional
    public AuthenticationResponse refreshAccessToken(String refreshToken) {
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user);
        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }


    public void sendVerificationEmail(String email, String ipAddress) throws MessagingException {
        log.info("Send verification email request for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Send verification failed - user not found: {}", email);
                    return new UsernameNotFoundException("User not found");
                });

        sendEmail(user, EmailTemplateName.VERIFY_ACCOUNT, ipAddress);
    }

    private void sendEmail(User user, EmailTemplateName templateName, String ipAddress) throws MessagingException, IllegalStateException {
        log.debug("Preparing to send {} email to: {}", templateName, user.getEmail());

        // Check rate limiting BEFORE doing any other operations
        checkRateLimit(user, templateName);

        TokenType tokenType = templateName == EmailTemplateName.VERIFY_ACCOUNT
                ? TokenType.VERIFY_ACCOUNT
                : TokenType.FORGOT_PASSWORD;

        // Invalidate previous tokens
        invalidatePreviousTokens(user, tokenType);

        String plainTextToken = generateAndSaveToken(user, tokenType, ipAddress);

        String emailSubject = templateName == EmailTemplateName.VERIFY_ACCOUNT
                ? "OTP Verification from UniVerse"
                : "Reset Password for UniVerse";

        emailService.sendEmail(
                platformMailId,
                user.getEmail(),
                emailSubject,
                plainTextToken,
                templateName
        );

        log.info("{} email sent successfully to: {}", templateName, user.getEmail());
    }

    private void checkRateLimit(User user, EmailTemplateName templateName) {
        log.debug("Checking rate limit for user: {} with template: {}", user.getEmail(), templateName);

        if (templateName == EmailTemplateName.VERIFY_ACCOUNT) {
            Optional<EmailVerificationToken> recentToken =
                    emailVerificationTokenRepository.findTopByUserOrderByCreatedAtDesc(user);

            if (recentToken.isPresent() &&
                    recentToken.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(2))) {
                log.warn("Rate limit hit for verification email: {}", user.getEmail());
                throw new IllegalStateException("Please wait before requesting a new OTP");
            }
        } else if (templateName == EmailTemplateName.FORGOT_PASSWORD) {
            Optional<PasswordResetToken> recentToken =
                    passwordResetTokenRepository.findTopByUserOrderByCreatedAtDesc(user);

            if (recentToken.isPresent() &&
                    recentToken.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(5))) {
                log.warn("Rate limit hit for password reset email: {}", user.getEmail());
                throw new IllegalStateException("Please wait before requesting a new password reset");
            }
        }
    }

    private String generateAndSaveToken(User user, TokenType type, String ipAddress) {
        log.debug("Generating {} token for user: {}", type, user.getEmail());

        String plainTextToken = generateToken(8);
        String hashedToken = hashToken(plainTextToken);

        switch (type) {
            case VERIFY_ACCOUNT -> {
                var token = EmailVerificationToken.builder()
                        .user(user)
                        .otp(hashedToken)
                        .expiresAt(LocalDateTime.now().plusMinutes(10))
                        .ipAddress(ipAddress)
                        .build();
                emailVerificationTokenRepository.save(token);
                log.debug("Email verification token created for user: {}", user.getEmail());
            }
            case FORGOT_PASSWORD -> {
                var token = PasswordResetToken.builder()
                        .user(user)
                        .token(hashedToken)
                        .expiresAt(LocalDateTime.now().plusMinutes(5))
                        .ipAddress(ipAddress)
                        .usedAt(null)
                        .build();
                passwordResetTokenRepository.save(token);
                log.debug("Password reset token created for user: {}", user.getEmail());
            }
            default -> {
                log.error("Invalid token type: {}", type);
                throw new IllegalStateException("Invalid token type");
            }
        }

        return plainTextToken;
    }

    private void invalidatePreviousTokens(User user, TokenType type) {
        log.debug("Invalidating previous {} tokens for user: {}", type, user.getEmail());

        switch (type) {
            case VERIFY_ACCOUNT -> emailVerificationTokenRepository.deleteByUserAndVerifiedAtIsNull(user);
            case FORGOT_PASSWORD -> passwordResetTokenRepository.deleteByUserAndUsedAtIsNull(user);
        }
    }

    private String generateToken(int length) {
        String characters = "0123456789";
        SecureRandom secureRandom = new SecureRandom();

        return secureRandom.ints(length, 0, characters.length())
                .mapToObj(characters::charAt)
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available", e);
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    public void logout(String accessToken, String refreshToken) {
        // Revoke access token
        RefreshToken token = refreshTokenRepository.findByTokenAndRevokedAtIsNull(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        token.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        // Blacklist access token
        Date expiration = jwtService.extractExpiration(accessToken);
        long ttl = expiration.getTime() - System.currentTimeMillis();
        tokenBlacklistService.blacklistTokens(accessToken, ttl);

        log.info("User logged out - both tokens invalidated");
    }

}
