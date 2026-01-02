package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.*;
import com.omkar.uni.verse.domain.entities.user.EmailTemplateName;
import com.omkar.uni.verse.services.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
@Slf4j
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Register a new user", description = "Creates a new user account and sends verification email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid registration data"),
            @ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<RegistrationResponse> register(
            @RequestBody @Valid RegistrationRequest registrationRequest,
            HttpServletRequest httpServletRequest
    ) throws MessagingException {
        log.info("Registration request received for email: {}", registrationRequest.getEmail());
        // Register user (transactional - commits to DB)
        RegistrationResponse response = authenticationService.register(registrationRequest);

        // Send verification email AFTER transaction commits
        // If email fails, user is still registered
        if ("ORGANIZER".equalsIgnoreCase(registrationRequest.getIntendedRole())) {
            authenticationService.sendOrganizerVerificationEmail(registrationRequest.getEmail(), httpServletRequest.getRemoteAddr());
        } else {
            authenticationService.sendVerificationEmail(registrationRequest.getEmail(), httpServletRequest.getRemoteAddr());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates user and returns JWT tokens")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "403", description = "Account not verified")
    })
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody @Valid LoginRequest loginRequest,
            HttpServletRequest httpServletRequest
    ) {
        log.info("Login request received for email: {}", loginRequest.getEmail());

        AuthenticationResponse response = authenticationService.login(loginRequest, httpServletRequest.getRemoteAddr(), httpServletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email with OTP", description = "Verifies user email using OTP and returns JWT tokens")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email verified successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired OTP"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<AuthenticationResponse> verifyEmail(
            @RequestBody @Valid VerifyEmailRequest verifyEmailRequest,
            HttpServletRequest httpServletRequest
    ) {
        log.info("Email verification request received for: {}", verifyEmailRequest.getEmail());

        AuthenticationResponse response = authenticationService.verifyEmail(verifyEmailRequest, httpServletRequest.getRemoteAddr(), httpServletRequest.getHeader("User-Agent"));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Sends a new verification OTP to user's email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verification email sent"),
            @ApiResponse(responseCode = "404", description = "User not found"),
            @ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<MessageResponse> resendVerification(
            @RequestBody @Valid ResendVerificationRequest request,
            HttpServletRequest httpServletRequest
    ) throws MessagingException {
        log.info("Resend verification request for: {}", request.email());

        authenticationService.sendVerificationEmail(request.email(), httpServletRequest.getRemoteAddr());

        return ResponseEntity.ok(new MessageResponse("Verification email sent successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Sends password reset OTP to user's email")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reset email sent if user exists"),
            @ApiResponse(responseCode = "429", description = "Rate limit exceeded")
    })
    public ResponseEntity<MessageResponse> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest forgotPasswordRequest,
            HttpServletRequest httpServletRequest
    ) throws MessagingException {
        log.info("Forgot password request received for: {}", forgotPasswordRequest.getEmail());

        authenticationService.sendPasswordResetEmail(forgotPasswordRequest, httpServletRequest.getRemoteAddr());

        // Generic message to prevent email enumeration
        return ResponseEntity.ok(
                new MessageResponse("If the email exists, a password reset link has been sent")
        );
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets user password using OTP")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password reset successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired token"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<MessageResponse> resetPassword(
            @RequestBody @Valid ResetPasswordRequest resetPasswordRequest
    ) {
        log.info("Reset password request received for: {}", resetPasswordRequest.getNewPassword());

        authenticationService.resetPassword(resetPasswordRequest);

        return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
    }


    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @RequestBody @Valid LogoutRequest logoutRequest
    ) {
        authenticationService.logout(logoutRequest.getAccessToken(), logoutRequest.getRefreshToken());
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }
}