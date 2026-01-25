package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubMembersDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubRejectionRequest;
import com.omkar.uni.verse.domain.dto.clubs.management.JoinClubRequest;
import com.omkar.uni.verse.domain.dto.clubs.management.ClubManagementResponse;
import com.omkar.uni.verse.domain.entities.clubs.ClubJoinRequest;
import com.omkar.uni.verse.domain.entities.clubs.JoinRequestStatus;
import com.omkar.uni.verse.services.ClubManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clubs/{slug}")
@RequiredArgsConstructor
public class ClubManagementController {
    private final ClubManagementService clubManagementService;

    @PostMapping("/join-requests")
    public ResponseEntity<MessageResponse> createClubJoinRequest(@PathVariable String slug, JoinClubRequest joinRequest) {
        return new ResponseEntity<>(
                clubManagementService.createClubJoinRequest(slug, joinRequest),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/join-requests")
    public ResponseEntity<Page<ClubJoinRequest>> getClubJoinRequests(
            @PathVariable String slug,
            @RequestParam(required = false) JoinRequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(clubManagementService.getAllClubJoinRequests(slug, status, page, size));
    }

    @PutMapping("/join-requests/{userId}/approve")
    public ResponseEntity<ClubManagementResponse> approveJoinClubRequest(@PathVariable String slug, @PathVariable UUID userId) {
        return ResponseEntity.ok(clubManagementService.approveClubJoinRequest(slug, userId));
    }

    @PutMapping("/join-requests/{userId}/reject")
    public ResponseEntity<ClubManagementResponse> rejectJoinClubRequest(
            @PathVariable String slug,
            @PathVariable UUID userId,
            @RequestBody @Valid ClubRejectionRequest rejectionRequest
    ) {
        return ResponseEntity.ok(clubManagementService.rejectClubJoinRequest(slug, userId, rejectionRequest));
    }

    @GetMapping("/members")
    public ResponseEntity<Page<ClubMembersDTO>> getAllMembers(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok().body(clubManagementService.getAllClubMembers(slug, page, size));
    }

    @PutMapping("/members/[userId}/promote")
    public ResponseEntity<ClubManagementResponse> promoteClubMember(@PathVariable String slug, @PathVariable UUID userId) {
        return ResponseEntity.ok().body(clubManagementService.promoteClubMember(slug, userId));
    }

    @DeleteMapping("/members/{userId}")
    public ResponseEntity<ClubManagementResponse> removeClubMember(@PathVariable String slug, @PathVariable UUID userId) {
        return ResponseEntity.ok().body(clubManagementService.removeClubMember(slug, userId));
    }

    @PostMapping("/leave")
    public ResponseEntity<ClubManagementResponse> leaveClub(@PathVariable String slug) {
        return ResponseEntity.ok().body(clubManagementService.leaveClub(slug));
    }
}
