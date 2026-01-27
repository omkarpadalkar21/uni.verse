package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.admin.OrganizerRejectionReason;
import com.omkar.uni.verse.domain.dto.admin.OrganizerVerificationResponse;
import com.omkar.uni.verse.domain.dto.admin.PlatformStatsDTO;
import com.omkar.uni.verse.domain.dto.admin.UserSuspensionReason;
import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.user.UserBasicDTO;
import com.omkar.uni.verse.domain.dto.user.UserProfileResponse;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import com.omkar.uni.verse.domain.entities.clubs.VerificationStatus;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.domain.entities.user.AccountStatus;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.services.AdminPanelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminPanelController {
    private final AdminPanelService adminPanelService;

    @GetMapping("/clubs")
    public ResponseEntity<PageResponse<ClubDTO>> getClubs(
            @RequestParam(required = false) ClubStatus status,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Page<ClubDTO> page = adminPanelService.getClubs(status, offset, pageSize);

        return ResponseEntity.ok().body(new PageResponse<>(
                page.getContent(),
                page.getTotalPages()
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserBasicDTO>> getUsers(
            @RequestParam(required = false) AccountStatus accountStatus,
            @RequestParam(required = false) RoleName roleName,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Page<UserBasicDTO> page = adminPanelService.getUsers(accountStatus, roleName, offset, pageSize);

        return ResponseEntity.ok().body(new PageResponse<>(
                page.getContent(),
                page.getTotalPages()
        ));
    }

    @PutMapping("/users/{id}/promote-faculty")
    public ResponseEntity<UserProfileResponse> promoteToFaculty(@PathVariable UUID id) {
        return ResponseEntity.ok().body(adminPanelService.promoteToFaculty(id));
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<UserProfileResponse> suspendUser(
            @PathVariable UUID id, @RequestBody @Valid UserSuspensionReason suspensionReason
    ) {
        return ResponseEntity.ok().body(adminPanelService.suspendUser(id, suspensionReason));
    }

    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsDTO> getPlatformStats(
            @RequestParam(required = false) ClubStatus clubStatus,
            @RequestParam(required = false) EventStatus eventStatus,
            @RequestParam(required = false) AccountStatus accountStatus
    ) {
        return ResponseEntity.ok().body(adminPanelService.getPlatformStats(clubStatus, eventStatus, accountStatus));
    }

    @GetMapping("organization-verification")
    public ResponseEntity<PageResponse<OrganizerVerificationResponse>> getOrganizerVerificationRequests(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        Page<OrganizerVerificationResponse> page = adminPanelService.getOrganizerVerificationRequests(status, offset, pageSize);
        return ResponseEntity.ok().body(
                new PageResponse<>(
                        page.getContent(),
                        page.getTotalPages()
                )
        );
    }

    @GetMapping("organization-verification/{id}")
    public ResponseEntity<OrganizerVerificationResponse> getOrganizerVerificationRequest(@PathVariable UUID id) {
        return ResponseEntity.ok().body(
                adminPanelService.getOrganizerVerificationRequest(id)
        );
    }

    @PutMapping("organization-verification/{id}/approve")
    public ResponseEntity<MessageResponse> approveOrganizerById(@PathVariable UUID id) {
        return ResponseEntity.ok().body(
                adminPanelService.approveOrganizer(id)
        );
    }

    @PutMapping("organization-verification/{id}/reject")
    public ResponseEntity<MessageResponse> rejectOrganizerById(@PathVariable UUID id, OrganizerRejectionReason rejectionReason) {
        return ResponseEntity.ok().body(
                adminPanelService.rejectOrganizer(id, rejectionReason)
        );
    }

}
