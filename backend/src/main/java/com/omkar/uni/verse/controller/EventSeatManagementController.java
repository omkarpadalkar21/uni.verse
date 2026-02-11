package com.omkar.uni.verse.controller;

import com.omkar.uni.verse.domain.dto.PageResponse;
import com.omkar.uni.verse.domain.dto.events.BookingSeatDTO;
import com.omkar.uni.verse.domain.dto.events.CreateVenueRequest;
import com.omkar.uni.verse.domain.dto.events.EventSeatResponse;
import com.omkar.uni.verse.domain.dto.events.VenueSummary;
import com.omkar.uni.verse.domain.dto.events.bookings.LockResult;
import com.omkar.uni.verse.services.EventSeatManagementService;
import com.omkar.uni.verse.services.SeatBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventSeatManagementController {

    private final EventSeatManagementService eventSeatManagementService;
    private final SeatBookingService seatBookingService;

    @GetMapping("/venues")
    public PageResponse<VenueSummary> getAllVenues(
            @RequestParam(defaultValue = "0") int pageSize,
            @RequestParam(defaultValue = "10") int offset) {
        Page<VenueSummary> page = eventSeatManagementService.getAllVenues(pageSize, offset);
        return new PageResponse<>(
                page.getContent(),
                page.getTotalPages()
        );
    }

    @PostMapping("/venues")
    public ResponseEntity<VenueSummary> addNewVenue(@RequestBody CreateVenueRequest createVenueRequest) {
        return new ResponseEntity<>(
                eventSeatManagementService.addNewVenue(createVenueRequest),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/events/{id}/seats")
    public ResponseEntity<EventSeatResponse> getEventSeats(@PathVariable UUID id) {
        return ResponseEntity.ok().body(eventSeatManagementService.getEventSeats(id));
    }

    @PostMapping("/booking/{id}/lock")
    public ResponseEntity<LockResult> lockSeat(@PathVariable Long id) {
        return new ResponseEntity<>(
                seatBookingService.lockSeat(id),
                HttpStatus.ACCEPTED
        );
    }

    @PostMapping("/booking/{id}/lock/release")
    public void releaseLockSeat(@PathVariable Long id) {
        seatBookingService.releaseLockSeat(id);
    }

    @PostMapping("/booking/{id}/confirm")
    public ResponseEntity<BookingSeatDTO> confirmSeatBooking(@PathVariable Long id){
        return new ResponseEntity<>(
                seatBookingService.confirmSeatBooking(id),
                HttpStatus.OK
        );
    }
}
