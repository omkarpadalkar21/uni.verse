package com.omkar.uni.verse.domain.entities.booking;

import com.omkar.uni.verse.domain.entities.events.Event;
import com.omkar.uni.verse.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "bookings",
        indexes = {
                @Index(name = "idx_bookings_event_id", columnList = "event_id"),
                @Index(name = "idx_bookings_user_id", columnList = "user_id"),
                @Index(name = "idx_bookings_status", columnList = "status"),
                @Index(name = "idx_bookings_created_at", columnList = "created_at"),
                @Index(name = "idx_bookings_payment_order_id", columnList = "payment_order_id")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Pricing
    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    // currency not required, targeted only for Indian Universities

    // Status
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // Payment gateway
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway", length = 20)
    private PaymentGateway paymentGateway;

    @Column(name = "payment_order_id")
    private String paymentOrderId;

    @Column(name = "payment_reference")
    private String paymentReference;

    // QR code
    @Column(name = "qr_code_data", columnDefinition = "TEXT")
    private String qrCodeData;

    // Timestamps
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
}

