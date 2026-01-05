package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.services.ClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
