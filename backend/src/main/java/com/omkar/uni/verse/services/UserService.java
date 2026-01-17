package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.user.UserProfileResponse;
import com.omkar.uni.verse.domain.dto.user.UpdateUserProfileRequest;
import com.omkar.uni.verse.domain.entities.user.User;

public interface UserService {
    public User updateUserProfile(UpdateUserProfileRequest updateUserProfileRequest);

    public UserProfileResponse getUserProfile(String email);
}
