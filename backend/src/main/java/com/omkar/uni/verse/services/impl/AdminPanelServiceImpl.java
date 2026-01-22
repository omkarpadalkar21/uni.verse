package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.admin.OrganizerVerificationResponse;
import com.omkar.uni.verse.domain.dto.admin.PlatformStatsDTO;
import com.omkar.uni.verse.domain.dto.admin.UserSuspensionReason;
import com.omkar.uni.verse.domain.dto.clubs.ClubDTO;
import com.omkar.uni.verse.domain.dto.user.UserBasicDTO;
import com.omkar.uni.verse.domain.dto.user.UserProfileResponse;
import com.omkar.uni.verse.domain.entities.clubs.ClubStatus;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.domain.entities.user.AccountStatus;
import com.omkar.uni.verse.domain.entities.user.RoleName;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.mappers.ClubMapper;
import com.omkar.uni.verse.mappers.UserMapper;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.repository.EventRepository;
import com.omkar.uni.verse.repository.UserRepository;
import com.omkar.uni.verse.services.AdminPanelService;
import com.omkar.uni.verse.utils.PaginationValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminPanelServiceImpl implements AdminPanelService {

    @Value("${platform.superadmin.count}")
    private int superAdminCount;

    private final ClubRepository clubRepository;
    private final ClubMapper clubMapper;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final EventRepository eventRepository;

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_FACULTY')")
    public Page<ClubDTO> getClubs(ClubStatus status, int offset, int pageSize) {
        log.debug("Fetching clubs with status: {}, offset: {}, pageSize: {}", status, offset, pageSize);

        PageRequest pageRequest = PaginationValidator.createValidatedPageRequest(offset, pageSize);

        Page<ClubDTO> clubs;
        if (status == null) {
            log.debug("ClubStatus is null, fetching all clubs regardless of status");
            clubs = clubRepository.findAll(pageRequest)
                    .map(clubMapper::toClubDTO);
            log.info("Retrieved {} clubs (all statuses) (page {}/{})",
                    clubs.getNumberOfElements(), offset + 1, clubs.getTotalPages());
        } else {
            clubs = clubRepository.findAllByClubStatus(status, pageRequest)
                    .map(clubMapper::toClubDTO);
            log.info("Retrieved {} clubs with status {} (page {}/{})",
                    clubs.getNumberOfElements(), status, offset + 1, clubs.getTotalPages());
        }

        return clubs;
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_FACULTY')")
    public Page<UserBasicDTO> getUsers(AccountStatus accountStatus, RoleName roleName, int offset, int pageSize) {
        log.debug("Fetching users with accountStatus: {}, role: {}, offset: {}, pageSize: {}",
                accountStatus, roleName, offset, pageSize);

        PageRequest pageRequest = PaginationValidator.createValidatedPageRequest(offset, pageSize);

        Page<UserBasicDTO> users;

        if (accountStatus != null && roleName != null) {
            // Filter by both status and role
            users = userRepository.findAllByAccountStatusAndRole(
                            accountStatus, roleName, pageRequest)
                    .map(userMapper::toUserBasicDto);
            log.info("Retrieved {} users with status {} and role {} (page {}/{})",
                    users.getNumberOfElements(), accountStatus, roleName, offset + 1, users.getTotalPages());
        } else if (accountStatus != null) {
            // Filter by status only
            users = userRepository.findAllByAccountStatus(
                            accountStatus, pageRequest)
                    .map(userMapper::toUserBasicDto);
            log.info("Retrieved {} users with status {} (all roles) (page {}/{})",
                    users.getNumberOfElements(), accountStatus, offset + 1, users.getTotalPages());
        } else if (roleName != null) {
            // Filter by role only
            users = userRepository.findAllByRole(
                            roleName, pageRequest)
                    .map(userMapper::toUserBasicDto);
            log.info("Retrieved {} users with role {} (all statuses) (page {}/{})",
                    users.getNumberOfElements(), roleName, offset + 1, users.getTotalPages());
        } else {
            // No filters - fetch all users
            log.debug("Both AccountStatus and RoleName are null, fetching all users");
            users = userRepository.findAll(pageRequest)
                    .map(userMapper::toUserBasicDto);
            log.info("Retrieved {} users (all statuses and roles) (page {}/{})",
                    users.getNumberOfElements(), offset + 1, users.getTotalPages());
        }

        return users;
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_SUPERADMIN')")
    @Transactional(rollbackFor = Exception.class)
    public UserProfileResponse promoteToFaculty(UUID userId) {

        if (userId == null) {
            log.error("Promotion failed: userId is null");
            throw new IllegalArgumentException("User ID cannot be null");
        }

        User userToBePromoted = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("Promotion failed: User with ID {} not found", userId);
                    return new EntityNotFoundException("User with ID " + userId + " not found");
                });

        log.info("Attempting to promote user {} to FACULTY", userToBePromoted.getEmail());

        // Check if user is already FACULTY
        if (userToBePromoted.getRole() == RoleName.FACULTY) {
            log.warn("Promotion failed: User {} is already FACULTY", userId);
            throw new IllegalStateException("User is already a FACULTY member");
        }

        // Prevent demotion of SUPERADMIN to FACULTY
        if (userToBePromoted.getRole() == RoleName.SUPERADMIN) {
            log.error("Promotion failed: Cannot demote SUPERADMIN {} to FACULTY", userId);
            throw new IllegalArgumentException("Cannot demote SUPERADMIN to FACULTY");
        }

        // Check if user account is active
        if (userToBePromoted.getAccountStatus() != AccountStatus.ACTIVE) {
            log.error("Promotion failed: User {} has account status: {}", userId, userToBePromoted.getAccountStatus());
            throw new IllegalStateException("Cannot promote user with account status: " + userToBePromoted.getAccountStatus());
        }

        RoleName previousRole = userToBePromoted.getRole();
        userToBePromoted.setRole(RoleName.FACULTY);
        userRepository.save(userToBePromoted);

        log.info("Successfully promoted user: {} from: {} to FACULTY by admin {}",
                userId, previousRole, getCurrentUserId());

        return userMapper.toUserProfileResponse(userToBePromoted);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_FACULTY')")
    @Transactional(rollbackFor = Exception.class)
    public UserProfileResponse suspendUser(UUID userId, UserSuspensionReason suspensionReason) {
        if (userId == null) {
            log.error("Suspension failed: userId is null");
            throw new IllegalArgumentException("User ID cannot be null");
        }

        User userToBeSuspended = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("Suspension failed: User with ID {} not found", userId);
                    return new EntityNotFoundException("User with ID " + userId + " not found");
                });

        log.info("Attempting to suspend user: {} with reason: {}", userToBeSuspended.getEmail(), suspensionReason.suspensionReason());
        // Prevent self-suspension
        User currentUser = getCurrentUser();
        if (currentUser.getId().equals(userId)) {
            log.error("Suspension failed: User {} attempted to suspend themselves", userId);
            throw new IllegalArgumentException("Cannot suspend your own account");
        }

        // Check if already suspended
        if (userToBeSuspended.getAccountStatus() == AccountStatus.SUSPENDED) {
            log.warn("Suspension failed: User {} is already suspended", userId);
            throw new IllegalStateException("User is already suspended");
        }

        // FACULTY cannot suspend other FACULTY or SUPERADMIN
        if (currentUser.getRole() == RoleName.FACULTY) {
            if (userToBeSuspended.getRole() == RoleName.FACULTY ||
                    userToBeSuspended.getRole() == RoleName.SUPERADMIN) {
                log.error("Suspension failed: FACULTY {} cannot suspend user {} with role {}",
                        currentUser.getId(), userId, userToBeSuspended.getRole());
                throw new IllegalArgumentException("FACULTY cannot suspend other FACULTY or SUPERADMIN users");
            }
        }

        // Set suspension metadata
        userToBeSuspended.setSuspendedAt(LocalDateTime.now());
        userToBeSuspended.setSuspendedBy(currentUser);
        userToBeSuspended.setSuspensionReason(suspensionReason.suspensionReason());

        // CRITICAL FIX: Actually set the account status to SUSPENDED
        userToBeSuspended.setAccountStatus(AccountStatus.SUSPENDED);

        userRepository.save(userToBeSuspended);

        log.warn("User {} suspended by {} (role: {}) for reason: {}",
                userId, currentUser.getId(), currentUser.getRole(), suspensionReason.suspensionReason());

        return userMapper.toUserProfileResponse(userToBeSuspended);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_FACULTY')")
    @Transactional(readOnly = true)
    public PlatformStatsDTO getPlatformStats(ClubStatus clubStatus, EventStatus eventStatus, AccountStatus accountStatus) {
        log.debug("Fetching platform stats with clubStatus: {}, eventStatus: {}, accountStatus: {}",
                clubStatus, eventStatus, accountStatus);

        // Apply sensible defaults for null parameters
        ClubStatus effectiveClubStatus = clubStatus != null ? clubStatus : ClubStatus.ACTIVE;
        EventStatus effectiveEventStatus = eventStatus != null ? eventStatus : EventStatus.PUBLISHED;
        AccountStatus effectiveAccountStatus = accountStatus != null ? accountStatus : AccountStatus.ACTIVE;

        if (clubStatus == null || eventStatus == null || accountStatus == null) {
            log.debug("Using defaults - clubStatus: {}, eventStatus: {}, accountStatus: {}",
                    effectiveClubStatus, effectiveEventStatus, effectiveAccountStatus);
        }

        long totalClubs = clubRepository.countClubByClubStatus(effectiveClubStatus);
        long totalEvents = eventRepository.countEventByStatus(effectiveEventStatus);
        long totalUsers = userRepository.countUsersByAccountStatus(effectiveAccountStatus) - superAdminCount;

        // Calculate pending approvals (clubs with PENDING status)
        long pendingApprovals = clubRepository.countClubByClubStatus(ClubStatus.PENDING);

        log.info("Platform stats: {} clubs ({}), {} events ({}), {} users ({}), {} pending approvals",
                totalClubs, effectiveClubStatus, totalEvents, effectiveEventStatus,
                totalUsers, effectiveAccountStatus, pendingApprovals);

        return PlatformStatsDTO.builder()
                .totalClubs(totalClubs)
                .totalEvents(totalEvents)
                .totalUsers(totalUsers)
                .pendingApprovals(pendingApprovals)
                .build();
    }

    @Override
    public MessageResponse approveOrganizers() {
        return null;
    }

    @Override
    public Page<OrganizerVerificationResponse> getOrganizerVerificationRequests() {
        return null;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            log.error("No authentication found in SecurityContext");
            throw new IllegalStateException("No authentication context available");
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof User)) {
            log.error("Authentication principal is not a User instance: {}",
                    principal != null ? principal.getClass().getName() : "null");
            throw new IllegalStateException("Invalid authentication principal type");
        }

        return (User) principal;
    }

    private UUID getCurrentUserId() {
        try {
            return getCurrentUser().getId();
        } catch (Exception e) {
            log.error("Failed to get current user ID", e);
            return null;
        }
    }
}
