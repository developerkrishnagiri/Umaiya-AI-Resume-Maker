package com.aicareer.service;

import com.aicareer.entity.AtsScore;
import com.aicareer.entity.Resume;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.AtsScoreRepository;
import com.aicareer.repository.ResumeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AtsService {

    private final AtsScoreRepository atsScoreRepository;
    private final ResumeRepository resumeRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AtsScore scanResume(String resumeId, String jobDescription, String userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ApiException("Resume not found", HttpStatus.NOT_FOUND));

        String resumeText = buildResumeText(resume);
        String aiResponse = geminiService.analyzeAts(resumeText,
                jobDescription != null ? jobDescription : "General professional role");

        AtsScore atsScore = parseAtsResponse(aiResponse, resume);
        atsScore.setJobDescription(jobDescription);
        atsScore.setScanType(jobDescription != null && !jobDescription.isBlank() ? "JD_MATCH" : "GENERAL");
        return atsScoreRepository.save(atsScore);
    }

    public List<AtsScore> getResumeHistory(String resumeId) {
        return atsScoreRepository.findByResumeIdOrderByCreatedAtDesc(resumeId);
    }

    public String improveWithAi(String text, String type) {
        return switch (type != null ? type : "bullet") {
            case "summary" -> geminiService.generateResumeSummary(text);
            case "bullet" -> geminiService.rewriteBullet(text, "professional");
            case "skills" -> geminiService.suggestSkills(text, "software engineer");
            default -> geminiService.rewriteBullet(text, "professional");
        };
    }

    public String generateCoverLetter(String resumeId, String jobDescription, String userId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ApiException("Resume not found", HttpStatus.NOT_FOUND));
        String context = buildResumeText(resume);
        return geminiService.generateCoverLetter(context, jobDescription);
    }

    private String buildResumeText(Resume r) {
        StringBuilder sb = new StringBuilder();
        sb.append("Name: ").append(r.getFullName()).append("\n");
        if (r.getSummary() != null)
            sb.append("Summary: ").append(r.getSummary()).append("\n");

        if (!r.getSkills().isEmpty()) {
            sb.append("Skills: ");
            r.getSkills().forEach(s -> sb.append(s.getName()).append(", "));
            sb.append("\n");
        }
        if (!r.getExperiences().isEmpty()) {
            sb.append("Experience:\n");
            r.getExperiences().forEach(e -> {
                sb.append("- ").append(e.getTitle()).append(" at ").append(e.getCompany())
                        .append(" (").append(e.getStartDate()).append(" - ")
                        .append(e.getCurrent() != null && e.getCurrent() ? "Present" : e.getEndDate()).append(")\n");
                if (e.getBullets() != null)
                    e.getBullets().forEach(b -> sb.append("  • ").append(b).append("\n"));
            });
        }
        if (!r.getEducations().isEmpty()) {
            sb.append("Education:\n");
            r.getEducations()
                    .forEach(e -> sb.append("- ").append(e.getDegree()).append(" in ").append(e.getFieldOfStudy())
                            .append(" from ").append(e.getInstitution()).append("\n"));
        }
        return sb.toString();
    }

    private AtsScore parseAtsResponse(String json, Resume resume) {
        try {
            JsonNode node = objectMapper.readTree(json);
            List<String> matched = new ArrayList<>();
            List<String> missing = new ArrayList<>();
            List<String> suggestions = new ArrayList<>();
            List<String> warnings = new ArrayList<>();

            node.path("matchedKeywords").forEach(n -> matched.add(n.asText()));
            node.path("missingKeywords").forEach(n -> missing.add(n.asText()));
            node.path("suggestions").forEach(n -> suggestions.add(n.asText()));
            node.path("formattingWarnings").forEach(n -> warnings.add(n.asText()));

            return AtsScore.builder()
                    .resume(resume)
                    .overallScore(BigDecimal.valueOf(node.path("overallScore").asDouble(70)))
                    .keywordScore(BigDecimal.valueOf(node.path("keywordScore").asDouble(65)))
                    .sectionScore(BigDecimal.valueOf(node.path("sectionScore").asDouble(75)))
                    .formattingScore(BigDecimal.valueOf(node.path("formattingScore").asDouble(80)))
                    .readabilityScore(BigDecimal.valueOf(node.path("readabilityScore").asDouble(75)))
                    .experienceScore(BigDecimal.valueOf(node.path("experienceScore").asDouble(70)))
                    .matchedKeywords(matched)
                    .missingKeywords(missing)
                    .suggestions(suggestions)
                    .formattingWarnings(warnings)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse ATS response: {}", e.getMessage());
            return AtsScore.builder()
                    .resume(resume)
                    .overallScore(BigDecimal.valueOf(70.0))
                    .keywordScore(BigDecimal.valueOf(65.0))
                    .sectionScore(BigDecimal.valueOf(75.0))
                    .formattingScore(BigDecimal.valueOf(80.0))
                    .readabilityScore(BigDecimal.valueOf(75.0))
                    .experienceScore(BigDecimal.valueOf(70.0))
                    .suggestions(List.of("Add more relevant keywords", "Quantify your achievements"))
                    .missingKeywords(List.of("Leadership", "Agile", "Communication"))
                    .matchedKeywords(List.of("Java", "Spring Boot", "PostgreSQL"))
                    .formattingWarnings(List.of("Use a clean single-column format"))
                    .build();
        }
    }
}
