package com.aicareer.controller;

import com.aicareer.entity.*;
import com.aicareer.enums.UserRole;
import com.aicareer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final PaymentRepository paymentRepository;
    private final ResumeRepository resumeRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalJobSeekers", userRepository.countByRole(UserRole.JOBSEEKER),
                "totalRecruiters", userRepository.countByRole(UserRole.RECRUITER),
                "activeJobs", jobRepository.countByStatus("ACTIVE"),
                "totalApplications", applicationRepository.count(),
                "totalRevenue", paymentRepository.sumSuccessfulRevenue(),
                "totalResumes", resumeRepository.count()));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(
                    userRepository
                            .findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                                    search, search, search, pageable));
        }
        return ResponseEntity.ok(userRepository.findAll(pageable));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<Map<String, String>> changeRole(
            @PathVariable String id,
            @RequestBody Map<String, String> req) {
        userRepository.findById(id).ifPresent(user -> {
            user.setRole(UserRole.valueOf(req.get("role").toUpperCase()));
            userRepository.save(user);
        });
        return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<Map<String, String>> toggleActive(@PathVariable String id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setActive(!user.getActive());
            userRepository.save(user);
        });
        return ResponseEntity.ok(Map.of("message", "User status toggled"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable String id) {
        jobRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Job deleted"));
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<Map<String, Object>> revenueAnalytics() {
        return ResponseEntity.ok(Map.of(
                "totalRevenue", paymentRepository.sumSuccessfulRevenue(),
                "successfulPayments", paymentRepository.countSuccessful(),
                "recentPayments", paymentRepository.findByStatus("SUCCESS")));
    }
}
