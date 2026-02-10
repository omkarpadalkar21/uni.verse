package com.omkar.uni.verse.scheduler;

import com.omkar.uni.verse.domain.entities.events.EventSeats;
import com.omkar.uni.verse.domain.entities.events.SeatStatus;
import com.omkar.uni.verse.repository.EventSeatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SeatLockCleanupScheduler {

    private final EventSeatsRepository eventSeatsRepository;

    @Scheduled(fixedRate = 60000) // every 1 min
    @Transactional
    public void cleanUpExpiredLocks() {
        LocalDateTime now = LocalDateTime.now();

        List<EventSeats> expiredSeats = eventSeatsRepository.findByStatusAndLockExpiresAtIsBefore(SeatStatus.LOCKED, now);
        if (expiredSeats.isEmpty()) {
            return;
        }

        log.info("Found {} expired seat locks to clean up", expiredSeats.size());

        for (EventSeats seat : expiredSeats) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setLockedBy(null);
            seat.setLockExpiresAt(null);
        }

        eventSeatsRepository.saveAll(expiredSeats);

        log.info("Cleaned up {} expired seat locks", expiredSeats.size());
    }
}
