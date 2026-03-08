package com.aicareer.controller;

import com.aicareer.entity.AtsScore;
import com.aicareer.entity.User;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.UserRepository;
import com.aicareer.service.AtsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ats")
@RequiredArgsConstructor
public class AtsController {

    private final AtsService atsService;
    private final UserRepository userRepository;

    private String getUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("/scan")
    public ResponseEntity<AtsScore> scan(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> req) {
        String resumeId = req.get("resumeId");
        String jobDescription = req.get("jobDescription");
        if (resumeId == null)
            throw new ApiException("resumeId is required", HttpStatus.BAD_REQUEST);
        return ResponseEntity.ok(atsService.scanResume(resumeId, jobDescription, getUserId(ud)));
    }

    @GetMapping("/history/{resumeId}")
    public ResponseEntity<List<AtsScore>> history(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String resumeId) {
        return ResponseEntity.ok(atsService.getResumeHistory(resumeId));
    }

    @PostMapping("/ai-improve")
    public ResponseEntity<?> aiImprove(@RequestBody Map<String, String> req) {
        String improved = atsService.improveWithAi(req.get("text"), req.get("type"));
        if (improved == null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "AI service returned no response"));
        }
        return ResponseEntity.ok(Map.of("improved", improved));
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<Map<String, String>> coverLetter(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> req) {
        String letter = atsService.generateCoverLetter(req.get("resumeId"), req.get("jobDescription"), getUserId(ud));
        return ResponseEntity.ok(Map.of("coverLetter", letter));
    }
}
