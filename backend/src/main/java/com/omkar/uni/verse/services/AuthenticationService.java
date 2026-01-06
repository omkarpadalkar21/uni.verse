package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.*;
import com.omkar.uni.verse.domain.entities.clubs.OrganizerVerification;
import com.omkar.uni.verse.domain.entities.clubs.OrganizerVerificationToken;
import com.omkar.uni.verse.domain.entities.clubs.VerificationStatus;
import com.omkar.uni.verse.domain.entities.user.*;
import com.omkar.uni.verse.mappers.UserMapper;
import com.omkar.uni.verse.repository.*;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
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
    private final OrganizerVerificationRepository organizerVerificationRepository;
    private final RateLimitingService rateLimitingService;
    private final OrganizerVerificationTokenRepository organizerVerificationTokenRepository;
    private final UserMapper userMapper;
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

        boolean isOrganizerRequest = "ORGANIZER".equalsIgnoreCase(registrationRequest.getIntendedRole());

        User newUser = userMapper.toEntity(registrationRequest);
        newUser.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        newUser.setUniversityEmailDomain(EXPECTED_DOMAIN);
        newUser.setAccountStatus(isOrganizerRequest ? AccountStatus.PENDING_VERIFICATION : AccountStatus.ACTIVE);

        userRepository.save(newUser);

        if (isOrganizerRequest) {
            OrganizerVerification verification = OrganizerVerification.builder()
                    .user(newUser)
                    .status(VerificationStatus.PENDING)
                    .build();

            organizerVerificationRepository.save(verification);
            log.info("Organizer verification request created for : {}", email);
        }

        log.info("User registered successfully: {}", email);

        return RegistrationResponse.builder()
                .message(isOrganizerRequest ? "Registration successful. Please upload leadership proof to activate your account " :
                        "Registration successful. Please verify your email")
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

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            log.warn("Password reset requested for non-existent email: {}", request.getEmail());
            // Don't throw exception - return silently to prevent enumeration
            return;
        }

        User user = userOpt.get();

        // Check rate limit using Bucket4j
        checkEmailRateLimit(user.getEmail());

        // Invalidate previous tokens
        invalidatePreviousTokens(user, TokenType.FORGOT_PASSWORD);

        // Generate and save new token
        String plainTextToken = generateAndSaveToken(user, TokenType.FORGOT_PASSWORD, ipAddress);

        // Send email
        emailService.sendEmail(
                platformMailId,
                user.getEmail(),
                "Reset Password for UniVerse",
                plainTextToken,
                EmailTemplateName.FORGOT_PASSWORD
        );

        log.info("Password reset email sent to {}", user.getEmail());
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

    public void sendOrganizerVerificationEmail(String email, String ipAddress) throws MessagingException {
        log.info("Sending organizer verification email to {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Organizer verification email failed - user not found: {}", email);
                    return new UsernameNotFoundException("User not found");
                });

        // Check rate limit using Bucket4j
        checkEmailRateLimit(user.getEmail());

        // Invalidate previous tokens
        invalidatePreviousTokens(user, TokenType.VERIFY_ORGANIZER);

        // Generate and save new token
        String plainTextToken = generateAndSaveToken(user, TokenType.VERIFY_ORGANIZER, ipAddress);

        // Send email
        emailService.sendEmail(
                platformMailId,
                user.getEmail(),
                "Organizer Verification from UniVerse",
                plainTextToken,
                EmailTemplateName.VERIFY_ORGANIZER
        );

        log.info("Organizer verification email sent successfully to {}", user.getEmail());
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
        log.info("Sending verification email to {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Verification email failed - user not found: {}", email);
                    return new UsernameNotFoundException("User not found");
                });


        checkEmailRateLimit(user.getEmail());

        // Invalidate previous tokens
        invalidatePreviousTokens(user, TokenType.VERIFY_ACCOUNT);

        // Generate and save new token
        String plainTextToken = generateAndSaveToken(user, TokenType.VERIFY_ACCOUNT, ipAddress);

        // Send email
        emailService.sendEmail(
                platformMailId,
                user.getEmail(),
                "OTP Verification from UniVerse",
                plainTextToken,
                EmailTemplateName.VERIFY_ACCOUNT
        );

        log.info("Verification email sent successfully to {}", user.getEmail());
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

            case VERIFY_ORGANIZER -> {
                var token = OrganizerVerificationToken.builder()
                        .user(user)
                        .otp(hashedToken)
                        .expiresAt(LocalDateTime.now().plusMinutes(10))
                        .ipAddress(ipAddress)
                        .build();
                organizerVerificationTokenRepository.save(token);
                log.debug("Organizer verification token created for user: {}", user.getEmail());
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
            case VERIFY_ORGANIZER -> organizerVerificationTokenRepository.deleteByUserAndVerifiedAtIsNull(user);
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

    private void checkEmailRateLimit(String email) {
        Bucket bucket = rateLimitingService.resolveEmailBucket(email);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (!probe.isConsumed()) {
            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            log.warn("Email rate limit exceeded for user: {}. Wait {} seconds", email, waitSeconds);
            throw new IllegalStateException(
                    String.format("Too many email requests. Please try again in %d seconds.", waitSeconds)
            );
        }

        log.debug("Email rate limit check passed for user: {}. Remaining: {}",
                email, probe.getRemainingTokens());
    }

}
