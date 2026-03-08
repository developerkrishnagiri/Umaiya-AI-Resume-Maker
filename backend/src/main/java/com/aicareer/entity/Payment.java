package com.aicareer.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    @Builder.Default
    private String currency = "USD";

    // stripe or razorpay
    private String gateway;
    private String transactionId;
    private String gatewayPaymentId;
    private String gatewayOrderId;
    private String gatewaySignature;

    // SUCCESS, FAILED, PENDING, REFUNDED
    @Builder.Default
    private String status = "PENDING";

    // SUBSCRIPTION, UPGRADE
    private String paymentType;
    private String plan;
    private String billingCycle;
    private String invoiceUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
