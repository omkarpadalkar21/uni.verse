package com.omkar.uni.verse.domain.dto.events;

import lombok.AllArgsConstructor;

import java.util.List;

@AllArgsConstructor
public class EventSeatResponse {
    private List<SeatDTO> seats;
    private SeatMapMetaData metadata;
}
