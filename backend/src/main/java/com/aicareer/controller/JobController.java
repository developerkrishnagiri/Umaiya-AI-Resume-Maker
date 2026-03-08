package com.aicareer.controller;

import com.aicareer.entity.*;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.UserRepository;
import com.aicareer.service.ExternalJobService;
import com.aicareer.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final ExternalJobService externalJobService;
    private final UserRepository userRepository;

    private String getUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    // ─── PUBLIC JOB SEARCH ───────────────────────────────────────────────────
    @GetMapping("/api/jobs/public/search")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) Double minSalary,
            @RequestParam(required = false) Double maxSalary,
            @RequestParam(required = false) String industry,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity
                .ok(jobService.searchJobs(keyword, location, jobType, minSalary, maxSalary, industry, page, size));
    }

    @GetMapping("/api/jobs/public/{id}")
    public ResponseEntity<Job> getJob(@PathVariable String id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // ─── EXTERNAL JOB SEARCH (Remotive + Adzuna) ────────────────────────────
    @GetMapping("/api/jobs/external/search")
    public ResponseEntity<Map<String, Object>> searchExternalJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(externalJobService.searchAllJobs(keyword, location, page, size));
    }

    // ─── JOB SEEKER ACTIONS ──────────────────────────────────────────────────
    @PostMapping("/api/jobs/{id}/apply")
    public ResponseEntity<Application> applyForJob(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id,
            @RequestBody Map<String, String> req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                jobService.applyForJob(getUserId(ud), id, req.get("resumeId"), req.get("coverLetter")));
    }

    @PostMapping("/api/jobs/{id}/save")
    public ResponseEntity<Map<String, String>> saveJob(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String id) {
        jobService.saveJob(getUserId(ud), id);
        return ResponseEntity.ok(Map.of("message", "Job saved"));
    }

    @DeleteMapping("/api/jobs/{id}/save")
    public ResponseEntity<Map<String, String>> unsaveJob(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String id) {
        jobService.unsaveJob(getUserId(ud), id);
        return ResponseEntity.ok(Map.of("message", "Job removed from saved"));
    }

    @GetMapping("/api/jobs/saved")
    public ResponseEntity<List<SavedJob>> getSavedJobs(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(jobService.getSavedJobs(getUserId(ud)));
    }

    @GetMapping("/api/jobs/applied")
    public ResponseEntity<List<Application>> getAppliedJobs(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(jobService.getAppliedJobs(getUserId(ud)));
    }

    // ─── RECRUITER ACTIONS ───────────────────────────────────────────────────
    @GetMapping("/api/recruiter/jobs")
    public ResponseEntity<List<Job>> getMyJobs(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(jobService.getRecruiterJobs(getUserId(ud)));
    }

    @PostMapping("/api/recruiter/jobs")
    public ResponseEntity<Job> createJob(
            @AuthenticationPrincipal UserDetails ud, @RequestBody Job job) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobService.createJob(getUserId(ud), job));
    }

    @PutMapping("/api/recruiter/jobs/{id}")
    public ResponseEntity<Job> updateJob(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id,
            @RequestBody Job jobData) {
        return ResponseEntity.ok(jobService.updateJob(id, getUserId(ud), jobData));
    }

    @DeleteMapping("/api/recruiter/jobs/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(
            @AuthenticationPrincipal UserDetails ud, @PathVariable String id) {
        jobService.deleteJob(id, getUserId(ud));
        return ResponseEntity.ok(Map.of("message", "Job deleted"));
    }

    @GetMapping("/api/recruiter/candidates/{jobId}")
    public ResponseEntity<Page<Application>> getCandidates(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobService.getCandidatesForJob(jobId, getUserId(ud), page, size));
    }

    @PutMapping("/api/recruiter/applications/{appId}/status")
    public ResponseEntity<Application> updateAppStatus(
            @PathVariable String appId,
            @RequestBody Map<String, String> req) {
        return ResponseEntity.ok(jobService.updateApplicationStatus(appId, req.get("status"), req.get("notes")));
    }
}
