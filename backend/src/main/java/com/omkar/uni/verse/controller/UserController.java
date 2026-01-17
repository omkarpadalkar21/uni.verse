package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.events.EventRegistrationSummary;
import com.omkar.uni.verse.domain.dto.user.UserProfileResponse;
import com.omkar.uni.verse.domain.dto.user.UpdateUserProfileRequest;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import com.omkar.uni.verse.services.EventRegistrationService;
import com.omkar.uni.verse.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final EventRegistrationService eventRegistrationService;

    @GetMapping("/profile/{email_id}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable String email_id) {
        UserProfileResponse userProfile = userService.getUserProfile(email_id);
        return ResponseEntity.ok().body(userProfile);
    }

    @PutMapping("/profile")
    public ResponseEntity<MessageResponse> updateUserProfile(@RequestBody @Valid UpdateUserProfileRequest updateUserProfileRequest) {
        userService.updateUserProfile(updateUserProfileRequest);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
    }

    @GetMapping("/registrations")
    public ResponseEntity<PageResponse<EventRegistrationSummary>> getUserEventRegistrations(
            @RequestParam(required = false) EventRegistrationStatus status,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Page<EventRegistrationSummary> page = eventRegistrationService.getUserEventRegistrations(status, offset, pageSize);
        return ResponseEntity.ok().body(
                new PageResponse<>(
                        page.getContent(),
                        page.getTotalPages()
                )
        );
    }
}
