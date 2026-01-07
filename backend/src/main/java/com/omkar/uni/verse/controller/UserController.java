package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.user.GetUserProfileResponse;
import com.omkar.uni.verse.domain.dto.user.UpdateUserProfileRequest;
import com.omkar.uni.verse.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile/{email_id}")
    public ResponseEntity<GetUserProfileResponse> getUserProfile(@PathVariable String email_id) {
        GetUserProfileResponse userProfile = userService.getUserProfile(email_id);
        return ResponseEntity.ok().body(userProfile);
    }

    @PutMapping("/profile")
    public ResponseEntity<MessageResponse> updateUserProfile(@RequestBody @Valid UpdateUserProfileRequest updateUserProfileRequest) {
        userService.updateUserProfile(updateUserProfileRequest);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
    }

}
