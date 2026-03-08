package com.aicareer.controller;

import com.aicareer.entity.Resume;
import com.aicareer.entity.User;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.UserRepository;
import com.aicareer.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    private String getUserId(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<Resume>> listResumes(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(resumeService.getUserResumes(getUserId(ud)));
    }

    @PostMapping
    public ResponseEntity<Resume> createResume(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Resume resumeData) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.createResume(getUserId(ud), resumeData));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResume(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id) {
        return ResponseEntity.ok(resumeService.getResumeById(id, getUserId(ud)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resume> updateResume(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id,
            @RequestBody Resume resumeData) {
        return ResponseEntity.ok(resumeService.updateResume(id, getUserId(ud), resumeData));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResume(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id) {
        resumeService.deleteResume(id, getUserId(ud));
        return ResponseEntity.ok(Map.of("message", "Resume deleted successfully"));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Resume> duplicateResume(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable String id) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.duplicateResume(id, getUserId(ud)));
    }

    @PostMapping("/import")
    public ResponseEntity<Resume> importResume(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resumeService.importResume(getUserId(ud), file));
    }
}
