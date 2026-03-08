package com.aicareer.controller;

import com.aicareer.entity.*;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.UserRepository;
import com.aicareer.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    private String getUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @GetMapping("/questions")
    public ResponseEntity<List<String>> getQuestions(
            @RequestParam(defaultValue = "behavioral") String category,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(interviewService.getQuestions(category, limit));
    }

    @PostMapping("/sessions")
    public ResponseEntity<InterviewSession> startSession(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                interviewService.startSession(getUserId(ud), req.get("category"), req.get("difficulty")));
    }

    @PostMapping("/sessions/{sessionId}/answer")
    public ResponseEntity<InterviewSession> submitAnswer(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> req) {
        int idx = Integer.parseInt(req.getOrDefault("questionIndex", "0").toString());
        String answer = (String) req.get("answer");
        return ResponseEntity.ok(interviewService.submitAnswer(sessionId, idx, answer));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<InterviewSession>> getSessions(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(interviewService.getUserSessions(getUserId(ud)));
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<InterviewSession> getSession(@PathVariable String sessionId) {
        return ResponseEntity.ok(interviewService.getSession(sessionId));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String sessionId) {
        interviewService.deleteSession(sessionId, getUserId(ud));
        return ResponseEntity.ok(Map.of("message", "Session deleted"));
    }
}
