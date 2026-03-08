package com.aicareer.controller;

import com.aicareer.entity.*;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.UserRepository;
import com.aicareer.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    private String getUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getPlans() {
        return ResponseEntity.ok(subscriptionService.getPlans());
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckout(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> req) {
        String plan = req.getOrDefault("plan", "PRO");
        String billingCycle = req.getOrDefault("billingCycle", "MONTHLY");
        return ResponseEntity.ok(subscriptionService.createCheckoutSession(getUserId(ud), plan, billingCycle));
    }

    @GetMapping("/my-plan")
    public ResponseEntity<Subscription> myPlan(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(subscriptionService.getOrCreateSubscription(getUserId(ud)));
    }

    @PostMapping("/cancel")
    public ResponseEntity<Map<String, String>> cancel(@AuthenticationPrincipal UserDetails ud) {
        subscriptionService.cancelSubscription(getUserId(ud));
        return ResponseEntity.ok(Map.of("message", "Subscription canceled. Access reverts to Free plan."));
    }

    // Stripe webhook - signature verification simplified for demo
    @PostMapping("/webhook")
    public ResponseEntity<String> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        // In production: verify signature with Stripe SDK
        // For now, handle the event from payload
        try {
            // Parse and handle: customer.subscription.updated, invoice.payment_succeeded,
            // etc.
            // Demo: just return 200
            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Webhook error");
        }
    }
}
