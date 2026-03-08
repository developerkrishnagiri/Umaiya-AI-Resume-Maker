package com.aicareer.entity;

import com.aicareer.enums.PlanType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PlanType plan = PlanType.FREE;

    // ACTIVE, CANCELED, PAST_DUE, TRIALING
    @Builder.Default
    private String status = "ACTIVE";

    private String stripeCustomerId;
    private String stripeSubscriptionId;
    private String razorpaySubscriptionId;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime canceledAt;

    @Builder.Default
    private Boolean autoRenew = true;

    // MONTHLY, ANNUAL
    private String billingCycle;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
