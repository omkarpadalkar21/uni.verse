package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.entities.events.EventCategory;
import com.omkar.uni.verse.services.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;

    @GetMapping
    public ResponseEntity<PageResponse<EventResponse>> getAllEvents(
            @RequestParam(required = false) UUID clubId,
            @RequestParam(required = false) EventCategory category,
            @RequestParam LocalDateTime dateTime,
            @RequestParam(required = false, defaultValue = "0") int offset,
            @RequestParam(required = false, defaultValue = "10") int pageSize
    ) {
        Page<EventResponse> page = eventService.getAllEvents(clubId, category, dateTime, offset, pageSize);

        return ResponseEntity.ok().body(
                new PageResponse<>(
                        page.getContent(),
                        page.getTotalPages()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable UUID id) {
        return ResponseEntity.ok().body(eventService.getEventById(id));
    }
}
