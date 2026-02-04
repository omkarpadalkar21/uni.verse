package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.events.SeatType;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
public class SeatMapMetaData {
    private Integer totalSeats;
    private Integer availableSeats;
    private List<String> sections;  // ["A", "B", "Balcony"]
    private Map<SeatType, BigDecimal> priceByType;
}
