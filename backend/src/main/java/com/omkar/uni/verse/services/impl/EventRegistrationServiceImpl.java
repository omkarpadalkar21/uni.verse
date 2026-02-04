package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.events.CancelEventRegistrationRequest;
import com.omkar.uni.verse.domain.dto.events.EventRegistrationResponse;
import com.omkar.uni.verse.domain.dto.events.EventRegistrationSummary;
import com.omkar.uni.verse.domain.dto.events.RejectEventRegistrationRequest;
import com.omkar.uni.verse.domain.dto.user.UserBasicDTO;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.events.*;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.mappers.EventMapper;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.repository.EventRegistrationRepository;
import com.omkar.uni.verse.repository.EventRepository;
import com.omkar.uni.verse.repository.UserRepository;
import com.omkar.uni.verse.services.EventRegistrationService;
import com.omkar.uni.verse.utils.PaginationValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventRegistrationServiceImpl implements EventRegistrationService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {"eventRegistrations", "userEventRegistrations"}, allEntries = true)
    public EventRegistrationResponse createEventRegistration(String slug, UUID eventId) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Event event = eventRepository.findByIdAndStatus(eventId, EventStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        EventRegistrationStatus registrationStatus = event.getRegistrationMode() == EventRegistrationMode.AUTO_APPROVE ?
                EventRegistrationStatus.APPROVED : EventRegistrationStatus.PENDING;

        EventRegistration newEventRegistration = EventRegistration.builder()
                .event(event)
                .user(currentUser)
                .status(registrationStatus)
                .build();

        eventRegistrationRepository.save(newEventRegistration);

        return new EventRegistrationResponse(
                registrationStatus,
                null
        );
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_CLUB_MEMBER','ROLE_CLUB_LEADER')")
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "eventRegistrations",
            key = "'club=' + #slug + ':eventId=' + #eventId + ':status=' + (#registrationStatus != null ? #registrationStatus : 'PENDING') + ':page=' + #offset + ':size=' + #pageSize"
    )
    public Page<EventRegistrationSummary> getClubEventRegistrations(String slug, UUID eventId, EventRegistrationStatus registrationStatus, int offset, int pageSize) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeadersAndMembers(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser)) &&
                club.getMembers().stream().noneMatch(clubMember -> clubMember.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to get club events for club '{}' (slug: {}) but is not a leader/member",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to perform this action");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        registrationStatus = registrationStatus != null ? registrationStatus : EventRegistrationStatus.PENDING;

        log.info("Fetching registrations for event {} with status {} for club '{}' (slug: {})",
                eventId, registrationStatus, club.getName(), slug);

        PageRequest pageRequest = PaginationValidator.createValidatedPageRequest(offset, pageSize);

        return eventRegistrationRepository.findByEventAndStatus(event, registrationStatus, pageRequest)
                .map(eventRegistration -> EventRegistrationSummary.builder()
                        .user(mapUserToBasicDTO(eventRegistration.getUser()))
                        .userEmail(eventRegistration.getUser().getEmail())
                        .registeredAt(eventRegistration.getRegisteredAt())
                        .registrationStatus(eventRegistration.getStatus())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            cacheNames = "userEventRegistrations"
            
    )
    public Page<EventRegistrationSummary> getUserEventRegistrations(EventRegistrationStatus status, int offset, int pageSize) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        log.info("Fetching event registrations for user {} with status filter: {}",
                currentUser.getEmail(), status != null ? status : "ALL");

        PageRequest pageRequest = PaginationValidator.createValidatedPageRequest(offset, pageSize);

        Page<EventRegistration> registrations = status != null
                ? eventRegistrationRepository.findEventRegistrationByUserAndStatus(currentUser, status, pageRequest)
                : eventRegistrationRepository.findEventRegistrationByUser(currentUser, pageRequest);

        return registrations.map(eventRegistration -> EventRegistrationSummary.builder()
                .eventSummary(eventMapper.toEventSummary(eventRegistration.getEvent()))
                .clubName(eventRegistration.getEvent().getClub().getName())
                .registeredAt(eventRegistration.getRegisteredAt())
                .registrationStatus(eventRegistration.getStatus())
                .build());
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_CLUB_MEMBER','ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {"eventRegistrations", "userEventRegistrations"}, allEntries = true)
    public EventRegistrationResponse approveEventRegistration(String slug, UUID eventId, UUID userId) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeadersAndMembers(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser)) &&
                club.getMembers().stream().noneMatch(clubMember -> clubMember.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to approve event registration for club '{}' (slug: {}) but is not a leader/member",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to perform this action");
        }

        Event event = eventRepository.findByIdAndStatus(eventId, EventStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Event not found or not published"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        User userRegistrationToBeApproved = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with registration to be approved"));

        EventRegistration registration = eventRegistrationRepository.findByUserAndEvent(userRegistrationToBeApproved, event)
                .orElseThrow(() -> new EntityNotFoundException("Event registration with the requested user not found"));

        if (registration.getStatus() == EventRegistrationStatus.APPROVED) {
            throw new IllegalStateException("Event registration request is already approved");
        }

        registration.setStatus(EventRegistrationStatus.APPROVED);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setReviewedBy(currentUser);
        registration.setReviewedAt(LocalDateTime.now());
        eventRegistrationRepository.save(registration);

        return new EventRegistrationResponse(EventRegistrationStatus.APPROVED, null);
    }

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_CLUB_MEMBER','ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {"eventRegistrations", "userEventRegistrations"}, allEntries = true)
    public EventRegistrationResponse rejectEventRegistration(String slug, UUID eventId, UUID userId, RejectEventRegistrationRequest rejectEventRegistrationRequest) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeadersAndMembers(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser)) &&
                club.getMembers().stream().noneMatch(clubMember -> clubMember.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to get reject event registration for club '{}' (slug: {}) but is not a leader/member",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to perform this action");
        }

        Event event = eventRepository.findByIdAndStatus(eventId, EventStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Event not found or not published"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }


        User userRegistrationToBeRejected = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with registration to be rejected"));

        EventRegistration registration = eventRegistrationRepository.findByUserAndEvent(userRegistrationToBeRejected, event)
                .orElseThrow(() -> new EntityNotFoundException("Event registration with the requested user not found"));

        if (registration.getStatus() == EventRegistrationStatus.REJECTED) {
            throw new IllegalStateException("Event registration request is already rejected");
        }

        registration.setStatus(EventRegistrationStatus.REJECTED);
        registration.setRejectionReason(rejectEventRegistrationRequest.rejectionReason());
        registration.setReviewedBy(currentUser);
        registration.setReviewedAt(LocalDateTime.now());
        eventRegistrationRepository.save(registration);

        return new EventRegistrationResponse(
                EventRegistrationStatus.REJECTED,
                rejectEventRegistrationRequest.rejectionReason()
        );
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "userEventRegistrations", allEntries = true)
    public MessageResponse cancelEventRegistration(String slug, UUID eventId, CancelEventRegistrationRequest cancelEventRegistrationRequest) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Event event = eventRepository.findByIdAndStatus(eventId, EventStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Event not found or not published"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        EventRegistration registration = eventRegistrationRepository.findByUserAndEvent(currentUser, event)
                .orElseThrow(() -> new EntityNotFoundException("Event registration with the requested user not found"));

        if (registration.getStatus() == EventRegistrationStatus.CANCELLED) {
            throw new IllegalStateException("Event registration is already cancelled");
        }

        registration.setStatus(EventRegistrationStatus.CANCELLED);
        registration.setCancellationReason(cancelEventRegistrationRequest.cancellationReason());
        registration.setCancelledAt(LocalDateTime.now());

        return new MessageResponse("Event registration cancelled successfully");
    }

    /**
     * Helper method to map User entity to UserBasicDTO
     */
    private UserBasicDTO mapUserToBasicDTO(User user) {
        return UserBasicDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .universityId(user.getUniversityId())
                .build();
    }
}
