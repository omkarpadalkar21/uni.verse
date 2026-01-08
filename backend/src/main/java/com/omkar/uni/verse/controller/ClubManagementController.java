package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.entities.clubs.ClubJoinRequest;
import com.omkar.uni.verse.services.ClubManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clubs")
@RequiredArgsConstructor
public class ClubManagementController {
    private final ClubManagementService clubManagementService;

    @GetMapping("/clubs/{slug}/join-requests")
    public ResponseEntity<Page<ClubJoinRequest>> getClubJoinRequests(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<ClubJoinRequest> requests = clubManagementService.getAllClubJoinRequests(slug, page, size);
        return ResponseEntity.ok(requests);
    }
}
