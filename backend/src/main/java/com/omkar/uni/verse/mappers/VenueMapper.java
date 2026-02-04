package com.omkar.uni.verse.mappers;

import com.omkar.uni.verse.domain.dto.events.CreateVenueRequest;
import com.omkar.uni.verse.domain.entities.events.EventVenue;
import org.mapstruct.Mapper;

import com.omkar.uni.verse.domain.dto.events.VenueSummary;

@Mapper(componentModel = "spring")
public interface VenueMapper {
    EventVenue toEventVenue(CreateVenueRequest createVenueRequest);
    
    VenueSummary toSummary(EventVenue venue);
}
