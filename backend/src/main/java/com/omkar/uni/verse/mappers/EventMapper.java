package com.omkar.uni.verse.mappers;

import com.omkar.uni.verse.domain.dto.events.EventCreateRequest;
import com.omkar.uni.verse.domain.dto.events.EventResponse;
import com.omkar.uni.verse.domain.entities.events.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventMapper {
    Event toEntity(EventCreateRequest eventCreateRequest);

    @Mapping(target = "type", source = "event.venueType")
    @Mapping(target = "createdByUser", source = "event.createdBy.email")
    EventResponse toEventResponse(Event event);
}
