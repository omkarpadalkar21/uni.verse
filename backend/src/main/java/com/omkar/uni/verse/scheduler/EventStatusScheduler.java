package com.omkar.uni.verse.scheduler;

import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.events.EventStatus;
import com.omkar.uni.verse.repository.EventRepository;
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
public class EventStatusScheduler {

    private final EventRepository eventRepository;

    /**
     * Scheduled task that runs every hour to mark completed events.
     * Finds all PUBLISHED events whose end time has passed and updates their status to COMPLETED.
     * 
     * Cron expression: "0 0 * * * *" means:
     * - Second: 0
     * - Minute: 0
     * - Hour: * (every hour)
     * - Day of month: * (every day)
     * - Month: * (every month)
     * - Day of week: * (every day of week)
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional(rollbackFor = Exception.class)
    public void markCompletedEvents() {
        LocalDateTime now = LocalDateTime.now();
        
        log.debug("Running scheduled task to mark completed events at {}", now);
        
        List<Event> eventsToComplete = eventRepository
            .findByStatusAndEndTimeBefore(EventStatus.PUBLISHED, now);
        
        if (eventsToComplete.isEmpty()) {
            log.debug("No events to mark as completed");
            return;
        }
        
        eventsToComplete.forEach(event -> {
            event.setStatus(EventStatus.COMPLETED);
            log.info("Marked event '{}' (ID: {}) as COMPLETED. End time was: {}", 
                    event.getTitle(), event.getId(), event.getEndTime());
        });
        
        eventRepository.saveAll(eventsToComplete);
        
        log.info("Successfully marked {} event(s) as COMPLETED", eventsToComplete.size());
    }
}
