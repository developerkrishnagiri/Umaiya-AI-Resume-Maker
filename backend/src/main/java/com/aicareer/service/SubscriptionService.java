package com.aicareer.service;

import com.aicareer.entity.*;
import com.aicareer.enums.PlanType;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.*;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.pro-price-id:price_pro}")
    private String proPriceId;

    @Value("${stripe.enterprise-price-id:price_enterprise}")
    private String enterprisePriceId;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public List<Map<String, Object>> getPlans() {
        return List.of(
                Map.of("id", "FREE", "name", "Free", "price", 0, "currency", "USD",
                        "features", List.of("2 resumes", "Basic ATS scan", "3 templates", "Community support"),
                        "limits", Map.of("resumes", 2, "atsScans", 5, "templates", 3)),
                Map.of("id", "PRO", "name", "Pro", "price", 19, "currency", "USD", "billingCycle", "monthly",
                        "features", List.of("Unlimited resumes", "Full AI ATS analysis", "All 10 templates",
                                "AI resume assistant", "Cover letter generator", "Priority support"),
                        "limits", Map.of("resumes", -1, "atsScans", -1, "templates", 10)),
                Map.of("id", "ENTERPRISE", "name", "Enterprise", "price", 99, "currency", "USD", "billingCycle",
                        "monthly",
                        "features", List.of("Everything in Pro", "Recruiter dashboard", "Advanced analytics",
                                "Team accounts (up to 10)", "API access", "Dedicated support"),
                        "limits", Map.of("resumes", -1, "atsScans", -1, "templates", 10)));
    }

    public Map<String, String> createCheckoutSession(String userId, String plan, String billingCycle) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            // Demo mode - simulate successful subscription
            activateSubscription(userId, plan, billingCycle, "demo_" + UUID.randomUUID());
            return Map.of("url", frontendUrl + "/dashboard?subscribed=true&plan=" + plan, "demo", "true");
        }

        try {
            Stripe.apiKey = stripeSecretKey;
            String priceId = "ENTERPRISE".equals(plan) ? enterprisePriceId : proPriceId;

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                    .setSuccessUrl(frontendUrl + "/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=" + plan)
                    .setCancelUrl(frontendUrl + "/pricing")
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build())
                    .putMetadata("userId", userId)
                    .putMetadata("plan", plan)
                    .build();

            Session session = Session.create(params);
            return Map.of("url", session.getUrl(), "sessionId", session.getId());
        } catch (Exception e) {
            log.error("Stripe checkout error: {}", e.getMessage());
            throw new ApiException("Payment service unavailable", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    public Subscription getOrCreateSubscription(String userId) {
        return subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    Subscription sub = Subscription.builder()
                            .user(user)
                            .plan(PlanType.FREE)
                            .status("ACTIVE")
                            .startDate(LocalDateTime.now())
                            .build();
                    return subscriptionRepository.save(sub);
                });
    }

    public void activateSubscription(String userId, String plan, String billingCycle, String stripeSubId) {
        User user = userRepository.findById(userId).orElseThrow();
        PlanType planType = PlanType.valueOf(plan.toUpperCase());

        Subscription sub = subscriptionRepository.findByUserId(userId).orElseGet(Subscription::new);
        sub.setUser(user);
        sub.setPlan(planType);
        sub.setStatus("ACTIVE");
        sub.setStripeSubscriptionId(stripeSubId);
        sub.setBillingCycle(billingCycle);
        sub.setStartDate(LocalDateTime.now());
        sub.setEndDate("ANNUAL".equals(billingCycle)
                ? LocalDateTime.now().plusYears(1)
                : LocalDateTime.now().plusMonths(1));
        subscriptionRepository.save(sub);

        user.setPlanType(planType);
        userRepository.save(user);
    }

    public void cancelSubscription(String userId) {
        subscriptionRepository.findByUserId(userId).ifPresent(sub -> {
            sub.setStatus("CANCELED");
            sub.setCanceledAt(LocalDateTime.now());
            sub.setAutoRenew(false);
            subscriptionRepository.save(sub);

            User user = sub.getUser();
            user.setPlanType(PlanType.FREE);
            userRepository.save(user);
        });
    }
}
