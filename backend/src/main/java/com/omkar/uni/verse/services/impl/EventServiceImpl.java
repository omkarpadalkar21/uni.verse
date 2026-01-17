package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.entities.clubs.Club;
import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventCategory;
import com.omkar.uni.verse.domain.entities.events.EventRegistrationStatus;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.mappers.EventMapper;
import com.omkar.uni.verse.repository.ClubRepository;
import com.omkar.uni.verse.repository.EventRegistrationRepository;
import com.omkar.uni.verse.repository.EventRepository;
import com.omkar.uni.verse.services.EventService;
import com.omkar.uni.verse.utils.PaginationValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {
    private final ClubRepository clubRepository;
    private final EventMapper eventMapper;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;


    @Override
    @Transactional(readOnly = true)
    public Page<EventResponse> getAllEvents(UUID clubId, EventCategory category, LocalDateTime dateTime, int page,
                                            int size) {
        Club club = null;
        if (clubId != null) {
            club = clubRepository.findById(clubId).orElse(null);
        }
        
        PageRequest pageRequest = PaginationValidator.createValidatedPageRequest(page, size);
        
        return eventRepository.findAllByClubAndCategoryAndEndTimeIsAfterAndCancelledAtIsNullAndStatus(
                club, category, dateTime, EventStatus.PUBLISHED, pageRequest
        ).map(eventMapper::toEventResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse getEventById(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        // Check if user is authenticated and registered for this event
        boolean isRegistered = false;
        try {
            Object principal = SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getPrincipal();

            // Only check registration if user is authenticated (not anonymous)
            if (principal instanceof User currentUser) {
                isRegistered = eventRegistrationRepository.existsByEventAndUserAndStatus(
                        event,
                        currentUser,
                        EventRegistrationStatus.APPROVED
                );
            }
        } catch (Exception e) {
            // If authentication context is not available or user is anonymous, isRegistered remains false
            log.debug("Could not determine user registration status: {}", e.getMessage());
        }

        return eventMapper.toEventResponse(event, isRegistered);
    }
}
