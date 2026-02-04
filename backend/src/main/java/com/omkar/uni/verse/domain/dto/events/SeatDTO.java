package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.events.SeatStatus;
import com.omkar.uni.verse.domain.entities.events.SeatType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class SeatDTO {
    private Long id;
    private String section;
    private String row;
    private Integer number;
    private SeatType type;
    private SeatStatus status;
    private BigDecimal price;
}
