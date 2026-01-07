package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.clubs.ClubResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubUpdateRequest;
import com.omkar.uni.verse.services.ClubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    @GetMapping("/{offset}/{pageSize}")
    public ResponseEntity<PageResponse<ClubDTO>> getAllClubs(@PathVariable int offset, @PathVariable int pageSize) {
        Page<ClubDTO> page = clubService.getAllClubs(offset, pageSize);
        return ResponseEntity.ok(new PageResponse<>(
                page.getContent(),
                page.getTotalPages()
        ));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ClubDTO> getClubBySlug(@PathVariable String slug) {
        return ResponseEntity.ok().body(clubService.getClubBySlug(slug));
    }


    @PutMapping("/{slug}")
    public ResponseEntity<ClubDTO> updateClubBySlug(@PathVariable String slug, @RequestBody @Valid ClubUpdateRequest updateRequest) {
        return ResponseEntity.ok().body(clubService.updateClubBySlug(slug, updateRequest));
    }

    @PutMapping("/{slug}/approve")
    public ResponseEntity<ClubResponse> approveClubBySlug(@PathVariable String slug) {
        return ResponseEntity.ok().body(clubService.approveClubBySlug(slug));
    }

    @PutMapping("/{slug}/reject")
    public ResponseEntity<ClubResponse> rejectClubBySlug(@PathVariable String slug) {
        return ResponseEntity.ok().body(clubService.rejectClubBySlug(slug));
    }

    @PutMapping("/{slug}/suspend")
    public ResponseEntity<ClubResponse> suspendClubBySlug(@PathVariable String slug) {
        return ResponseEntity.ok().body(clubService.suspendClubBySlug(slug));
    }
}
