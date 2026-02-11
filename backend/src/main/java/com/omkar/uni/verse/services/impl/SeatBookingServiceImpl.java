package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.domain.dto.events.BookingSeatDTO;
import com.omkar.uni.verse.domain.dto.events.bookings.BatchLockResult;
import com.omkar.uni.verse.domain.dto.events.bookings.LockResult;
import com.omkar.uni.verse.domain.entities.events.EventSeats;
import com.omkar.uni.verse.domain.entities.events.SeatStatus;
import com.omkar.uni.verse.domain.entities.user.User;
import com.omkar.uni.verse.repository.EventSeatsRepository;
import com.omkar.uni.verse.services.RedisLockService;
import com.omkar.uni.verse.services.SeatBookingService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatBookingServiceImpl implements SeatBookingService {

    private final RedisLockService redisLockService;

    private static final long LOCK_TTL_SECONDS = 30;
    private static final Duration SEAT_HOLD_DURATION = Duration.ofMinutes(5);
    private final EventSeatsRepository eventSeatsRepository;

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "eventSeats", allEntries = true)
    public LockResult lockSeat(Long seatId) {
        String lockToken = UUID.randomUUID().toString();
        String resource = "seat:" + seatId;

        boolean lockAcquired = redisLockService.tryLock(
                resource,
                lockToken,
                LOCK_TTL_SECONDS,
                TimeUnit.SECONDS
        );

        if (!lockAcquired) {
            log.warn("Could not acquire lock for seat: {}", seatId);
            return LockResult.failure("Seat is currently being booked by another user. Please try again.");
        }

        try {
            EventSeats seat = eventSeatsRepository.findById(seatId)
                    .orElseThrow(() -> new EntityNotFoundException("Seat not found: " + seatId));

            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                log.warn("Seat: {} not available. Current status: {}", seatId, seat.getStatus());
                return LockResult.failure("Seat is no longer available");
            }

            if (seat.getLockExpiresAt() != null && seat.getLockExpiresAt().isAfter(LocalDateTime.now())) {
                log.warn("Seat {} has an active lock that hasn't expired yet", seatId);
                return LockResult.failure("Seat is currently held by another user");
            }

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User currentUser)) {
                throw new IllegalStateException("Invalid user authentication");
            }

            seat.setStatus(SeatStatus.LOCKED);
            seat.setLockedBy(currentUser);
            seat.setLockExpiresAt(LocalDateTime.now().plus(SEAT_HOLD_DURATION));

            eventSeatsRepository.save(seat);
            log.info("Seat {} locked by user: {} until {}", seatId, currentUser.getEmail(), seat.getLockExpiresAt());

            return LockResult.success(seat.getLockExpiresAt());
        } catch (Exception e) {
            log.error("Error locking seat: {}, {}", seatId, e.getMessage(), e);
            return LockResult.failure("An error occurred while locking the seat.");
        } finally {
            redisLockService.unlock(resource, lockToken);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(
            cacheNames = "eventSeats",
            key = "#result != null && #result.booking != null ? 'id=' + #result.booking.eventId : 'empty'",
            condition = "#result != null"
    )
    public BookingSeatDTO confirmSeatBooking(Long seatId) {
        String lockToken = UUID.randomUUID().toString();
        String resource = "seat:" + seatId;

        if (!redisLockService.tryLock(resource, lockToken, LOCK_TTL_SECONDS, TimeUnit.SECONDS)) {
            throw new IllegalStateException("Could not acquire lock for seat confirmation");
        }

        try {
            EventSeats seat = eventSeatsRepository.findById(seatId)
                    .orElseThrow(() -> new EntityNotFoundException("Seat not found"));

            if (seat.getStatus() != SeatStatus.LOCKED) {
                throw new IllegalStateException("Seat is not in locked state");
            }

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User currentUser)) {
                throw new IllegalStateException("Invalid user authentication");
            }

            if (seat.getLockedBy() == null || !seat.getLockedBy().equals(currentUser)) {
                throw new IllegalStateException("Seat is locked by a different user");
            }

            if (seat.getLockExpiresAt() != null && seat.getLockExpiresAt().isBefore(LocalDateTime.now())) {
                throw new IllegalStateException("Seat lock has expired");
            }

            seat.setStatus(SeatStatus.BOOKED);
            seat.setLockExpiresAt(null);

            eventSeatsRepository.save(seat);

            log.info("Seat {} confirmed for user {}", seatId, currentUser.getId());
        } finally {
            redisLockService.unlock(resource, lockToken);
        }

        return new BookingSeatDTO();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "eventSeats", allEntries = true)
    public void releaseLockSeat(Long seatId) {
        String lockToken = UUID.randomUUID().toString();
        String resource = "seat:" + seatId;

        if (!redisLockService.tryLock(resource, lockToken, LOCK_TTL_SECONDS, TimeUnit.SECONDS)) {
            log.warn("Could not acquire lock to release seat: {}", seatId);
            return;
        }

        try {
            EventSeats seat = eventSeatsRepository.findById(seatId)
                    .orElseThrow(() -> new EntityNotFoundException("Seat not found"));

            UUID userId = ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();

            if (seat.getStatus() == SeatStatus.LOCKED && seat.getLockedBy() != null && seat.getLockedBy().getId().equals(userId)) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockedBy(null);
                seat.setLockExpiresAt(null);

                eventSeatsRepository.save(seat);

                log.info("Seat: {} lock released by user: {}", seatId, userId);
            }
        } finally {
            redisLockService.unlock(resource, lockToken);
        }

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    @CacheEvict(cacheNames = "eventSeats", allEntries = true)
    public BatchLockResult lockMultipleSeats(List<Long> eventSeatIds) {
        if (eventSeatIds == null || eventSeatIds.isEmpty()) {
            return BatchLockResult.failure("No seats provided");
        }

        List<Long> uniqueSeatIds = new ArrayList<>(new LinkedHashSet<>(eventSeatIds));

        List<SeatLockAttempt> attempts = uniqueSeatIds.stream()
                .map(seatId -> new SeatLockAttempt(
                        seatId,
                        UUID.randomUUID().toString(),
                        "seat:" + seatId
                )).toList();

        boolean allSeatsLocked = true;
        for (var attempt : attempts) {
            attempt.acquired = redisLockService.tryLock(
                    attempt.resource,
                    attempt.token,
                    LOCK_TTL_SECONDS,
                    TimeUnit.SECONDS
            );

            if (!attempt.acquired) {
                allSeatsLocked = false;
                break;
            }
        }

        if (!allSeatsLocked) {
            releaseAllLocks(attempts);
            return BatchLockResult.failure("One or more seats are currently being booked");
        }

        try {
            List<EventSeats> seats = eventSeatsRepository.findAllById(uniqueSeatIds);
            if (seats.size() != uniqueSeatIds.size()) {
                return BatchLockResult.failure("Some seats not found");
            }

            for (var seat : seats) {
                if (seat.getStatus() != SeatStatus.AVAILABLE) {
                    return BatchLockResult.failure("Seat " + seat.getId() + " is not available");
                }
            }

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (!(principal instanceof User currentUser)) {
                throw new IllegalStateException("Invalid user authentication");
            }
            LocalDateTime lockExpiry = LocalDateTime.now().plus(SEAT_HOLD_DURATION);

            for (var seat : seats) {
                seat.setStatus(SeatStatus.LOCKED);
                seat.setLockedBy(currentUser);
                seat.setLockExpiresAt(lockExpiry);
            }

            eventSeatsRepository.saveAll(seats);

            log.info("Locked {} seats for users: {}", seats.size(), currentUser.getId());

            return BatchLockResult.success(lockExpiry, seats.size());
        } catch (Exception e) {
            log.error("Error locking multiple seats", e);
            return BatchLockResult.failure("Error occurred while locking seats");
        } finally {
            releaseAllLocks(attempts);
        }
    }

    private void releaseAllLocks(List<SeatLockAttempt> attempts) {
        for (var attempt : attempts) {
            if (attempt.acquired) {
                redisLockService.unlock(attempt.resource, attempt.token);
            }
        }
    }


    private static class SeatLockAttempt {
        final Long seatId;
        final String token;
        final String resource;
        boolean acquired = false;

        public SeatLockAttempt(Long seatId, String token, String resource) {
            this.seatId = seatId;
            this.token = token;
            this.resource = resource;
        }
    }
}
