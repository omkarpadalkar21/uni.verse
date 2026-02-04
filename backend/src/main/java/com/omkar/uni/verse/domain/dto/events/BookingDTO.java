package com.omkar.uni.verse.domain.dto.events;

import com.omkar.uni.verse.domain.entities.booking.BookingStatus;
import com.omkar.uni.verse.domain.entities.booking.PaymentGateway;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingDTO {
    private UUID id;
    private UUID eventId;
    private String eventName;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private PaymentGateway paymentGateway;
    private String paymentOrderId;
    private String paymentReference;
    private String qrCodeData;
    private LocalDateTime createdAt;
}
