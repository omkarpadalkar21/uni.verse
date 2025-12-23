package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.*;
import com.omkar.uni.verse.services.AuthenticationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseEntity<RegistrationResponse> register(@RequestBody @Valid RegistrationRequest registrationRequest) throws MessagingException {
        // Register user (transactional - commits to DB)
        RegistrationResponse response = authenticationService.register(registrationRequest);
        
        // Send verification email AFTER transaction commits
        // If email fails, user is still registered
        authenticationService.sendVerificationEmail(registrationRequest.getEmail());
        
        return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody @Valid LoginRequest loginRequest) {
        return new ResponseEntity<>(
                authenticationService.login(loginRequest),
                HttpStatus.ACCEPTED
        );
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthenticationResponse> verifyEmail(@RequestBody @Valid VerifyEmailRequest verifyEmailRequest) {
        return new ResponseEntity<>(
                authenticationService.verifyEmail(verifyEmailRequest),
                HttpStatus.ACCEPTED
        );
    }
}
