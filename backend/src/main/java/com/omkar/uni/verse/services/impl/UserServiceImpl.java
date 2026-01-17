package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.user.UserProfileResponse;
import com.omkar.uni.verse.domain.dto.user.UpdateUserProfileRequest;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.mappers.UserMapper;
import com.omkar.uni.verse.repository.ClubFollowerRepository;
import com.omkar.uni.verse.repository.UserRepository;
import com.omkar.uni.verse.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final ClubFollowerRepository clubFollowerRepository;

    private final UserMapper userMapper;

    @Override
    public User updateUserProfile(UpdateUserProfileRequest updateUserProfileRequest) {
        User user = userRepository.findByEmail(updateUserProfileRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setFirstName(updateUserProfileRequest.getFirstName());
        user.setLastName(updateUserProfileRequest.getLastName());
        user.setPhone(updateUserProfileRequest.getPhone());
        user.setBio(updateUserProfileRequest.getBio());
        user.setAvatarUrl(updateUserProfileRequest.getAvatarUrl());

        log.info("Updated User profile for user: {}", user.getEmail());
        return userRepository.save(user);
    }

    @Override
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Extract club names from ClubFollower entities
        Set<String> joinedClubs = clubFollowerRepository.findClubFollowerByUser(user)
                .orElse(Set.of())
                .stream()
                .map(clubFollower -> clubFollower.getClub().getName())
                .collect(java.util.stream.Collectors.toSet());

        UserProfileResponse userProfileResponse = userMapper.toUserProfileResponse(user);
        userProfileResponse.setJoinedClub(joinedClubs);

        return userProfileResponse;
    }
}
