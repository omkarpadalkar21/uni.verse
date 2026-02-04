package com.omkar.uni.verse.mappers;

import com.omkar.uni.verse.domain.dto.events.SeatDTO;
import com.omkar.uni.verse.domain.entities.events.EventSeats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SeatMapper {
    @Mapping(source = "seat.rowLabel", target = "row")
    @Mapping(source = "seat.seatNumber", target = "number")
    @Mapping(source = "seat.type", target = "type")
    @Mapping(source = "seat.section", target = "section")
    SeatDTO toSeatDTO(EventSeats seat);
}
