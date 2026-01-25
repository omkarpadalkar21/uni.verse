package com.omkar.uni.verse.services.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.omkar.uni.verse.domain.dto.MessageResponse;
import com.omkar.uni.verse.domain.dto.events.EventCancelRequest;
import com.omkar.uni.verse.domain.dto.events.EventCreateRequest;
import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.dto.events.EventUpdateRequest;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.domain.entities.events.EventVenue;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.mappers.EventMapper;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.repository.EventRepository;
import com.omkar.uni.verse.repository.EventVenueRepository;
import com.omkar.uni.verse.services.EventManagementService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventManagementServiceImpl implements EventManagementService {

    private final ClubRepository clubRepository;
    private final EventMapper eventMapper;
    private final EventVenueRepository eventVenueRepository;
    private final EventRepository eventRepository;

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "events", allEntries = true)
    public EventResponse createEvent(String slug, EventCreateRequest eventCreateRequest) {
        log.debug("Attempting to create new event for club with slug: {}", slug);

        if (eventCreateRequest.getIsPaid() && eventCreateRequest.getBasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Paid events must have a base price");
        }

        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            log.warn("Access denied: User {} attempted to create event for club '{}' (slug: {}) but is not a leader",
                    currentUser.getEmail(), club.getName(), slug);
            throw new AccessDeniedException("You are not authorized to perform this action");
        }

        EventVenue venue = eventVenueRepository.findById(eventCreateRequest.getVenueId())
                .orElseThrow(() -> new EntityNotFoundException("Event venue not found"));

        Event newEvent = eventMapper.toEntity(eventCreateRequest);
        newEvent.setClub(club);
        newEvent.setVenueType(venue.getType());
        newEvent.setVenue(venue);
        newEvent.setCreatedBy(currentUser);

        eventRepository.save(newEvent);

        club.getEvents().add(newEvent);
        clubRepository.incrementEventCount(club.getId());

        log.info("Successfully created new event for club: {} by user: {}", club.getName(), currentUser.getEmail());
        return eventMapper.toEventResponse(newEvent);
    }


    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {"event", "events"}, key = "#eventId", allEntries = true)
    public EventResponse updateEventById(String slug, UUID eventId, EventUpdateRequest eventUpdateRequest) {
        isClubLeader(slug);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found for updating"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        event.setTitle(eventUpdateRequest.getTitle());
        event.setDescription(eventUpdateRequest.getDescription());
        if (eventUpdateRequest.getStartTime() != null) {
            event.setStartTime(eventUpdateRequest.getStartTime());
        }
        if (eventUpdateRequest.getEndTime() != null && event.getStartTime().isBefore(eventUpdateRequest.getEndTime())) {
            event.setEndTime(eventUpdateRequest.getEndTime());
        }
        event.setCapacity(eventUpdateRequest.getCapacity());
        event.setRegistrationMode(eventUpdateRequest.getRegistrationMode());


        eventRepository.save(event);
        return eventMapper.toEventResponse(event);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {"event", "events"}, key = "#eventId", allEntries = true)
    public MessageResponse deleteEventById(String slug, UUID eventId) {
        isClubLeader(slug);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found for updating"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        // soft deleting the event
        event.setStatus(EventStatus.DELETED);
        event.setDeletedAt(LocalDateTime.now());

        eventRepository.save(event);

        clubRepository.decrementEventCount(slug);

        return new MessageResponse("Event successfully deleted");
    }


    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = {"event", "events"}, key = "#eventId", allEntries = true)
    public EventResponse publishEventsById(String slug, UUID eventId) {
        isClubLeader(slug);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found for updating"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        if (event.getStatus() == EventStatus.PUBLISHED) {
            throw new IllegalStateException("Event is already published");
        }

        event.setStatus(EventStatus.PUBLISHED);
        event.setPublishedAt(LocalDateTime.now());

        eventRepository.save(event);

        return eventMapper.toEventResponse(event);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CLUB_LEADER')")
    @CacheEvict(cacheNames = {"event", "events"}, key = "#eventId", allEntries = true)
    public EventResponse cancelEventsById(String slug, UUID eventId, EventCancelRequest eventCancelRequest) {
        isClubLeader(slug);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found for updating"));

        if (!event.getClub().getSlug().equals(slug)) {
            throw new AccessDeniedException("Event does not belong to this club");
        }

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new IllegalStateException("Event is already cancelled");
        }

        event.setStatus(EventStatus.CANCELLED);
        event.setCancellationReason(eventCancelRequest.message());
        event.setCancelledAt(LocalDateTime.now());

        eventRepository.save(event);

        return eventMapper.toEventResponse(event);
    }

    private void isClubLeader(String slug) {
        User currentUser = (User) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        Club club = clubRepository.findBySlugWithLeaders(slug)
                .orElseThrow(() -> new EntityNotFoundException("Club not found"));

        if (club.getLeaders().stream().noneMatch(clubLeader -> clubLeader.getUser().equals(currentUser))) {
            throw new AccessDeniedException("You are not authorized to perform this action");
        }

    }
}
