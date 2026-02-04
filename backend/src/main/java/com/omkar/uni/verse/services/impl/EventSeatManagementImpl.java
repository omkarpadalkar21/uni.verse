package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.events.*;
import com.omkar.uni.verse.domain.entities.events.*;
import com.omkar.uni.verse.mappers.SeatMapper;
import com.omkar.uni.verse.mappers.VenueMapper;
import com.omkar.uni.verse.repository.EventRepository;
import com.omkar.uni.verse.repository.EventSeatsRepository;
import com.omkar.uni.verse.repository.EventVenueRepository;
import com.omkar.uni.verse.services.EventSeatManagement;
import com.omkar.uni.verse.utils.PaginationValidator;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventSeatManagementImpl implements EventSeatManagement {

    private final VenueMapper venueMapper;
    private final EventVenueRepository eventVenueRepository;
    private final EventRepository eventRepository;
    private final EventSeatsRepository eventSeatsRepository;
    private final SeatMapper seatMapper;

    @Override
    @PreAuthorize("hasAnyAuthority('ROLE_SUPERADMIN','ROLE_FACULTY')")
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "venues", allEntries = true)
    public VenueSummary addNewVenue(CreateVenueRequest createVenueRequest) {
        EventVenue venue = venueMapper.toEventVenue(createVenueRequest);
        eventVenueRepository.save(venue);
        return venueMapper.toSummary(venue);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "venues", key = "'page='+ #pageSize + ',offset=' + #offset")
    public Page<VenueSummary> getAllVenues(int pageSize, int offset) {
        PageRequest pageRequest = PaginationValidator.createValidatedPageRequest(pageSize, offset);
        return eventVenueRepository.getAll(pageRequest).map(venueMapper::toSummary);
    }

    @Override
    @Cacheable(cacheNames = "eventSeats", key = "'id=' + #eventId")
    public EventSeatResponse getEventSeats(UUID eventId) {
        Event event = eventRepository.findByIdAndStatus(eventId, EventStatus.PUBLISHED)
                .orElseThrow(() -> new EntityNotFoundException("Event not found or not published"));

        List<EventSeats> eventSeats = eventSeatsRepository.findByEventWithSeats(event);
        List<SeatDTO> seats = eventSeats.stream()
                .map(seatMapper::toSeatDTO).toList();

        Long bookedSeatsCount = eventSeatsRepository.countBookedSeatsByEventId(eventId);
        List<String> sections = seats.stream().map(SeatDTO::getSection).distinct().toList();

        // Create a map of SeatType to Price from EventSeats
        Map<SeatType, BigDecimal> priceByType = eventSeats.stream()
                .collect(Collectors.toMap(
                        es -> es.getSeat().getType(),
                        EventSeats::getPrice,
                        (existing, replacement) -> existing // Keep first price if duplicate types
                ));

        return new EventSeatResponse(
                seats,
                new SeatMapMetaData(
                        event.getCapacity(),
                        event.getCapacity() - bookedSeatsCount.intValue(),
                        sections,
                        priceByType
                )
        );
    }

    @Override
    @CacheEvict(cacheNames = "eventSeats", allEntries = true)
    public SeatLockResponse lockSeats(UUID eventId, List<Long> seatIds) {
        return null;
    }

    @Override
    @CacheEvict(
            cacheNames = "eventSeats",
            key = "#result != null && #result.booking != null ? 'id=' + #result.booking.eventId : 'empty'",
            condition = "#result != null"
    )
    public BookingSeatDTO bookingConfirmation(UUID bookingId) {
        return null;
    }
}
