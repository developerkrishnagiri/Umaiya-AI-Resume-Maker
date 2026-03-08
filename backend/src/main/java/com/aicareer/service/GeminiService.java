package com.aicareer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class GeminiService {

        @Value("${gemini.api-key:}")
        private String apiKey;

        @Value("${gemini.model:gemini-1.5-flash}")
        private String model;

        private final OkHttpClient httpClient = new OkHttpClient.Builder()
                        .connectTimeout(30, TimeUnit.SECONDS)
                        .readTimeout(60, TimeUnit.SECONDS)
                        .build();

        private final ObjectMapper objectMapper = new ObjectMapper();

        public String generateContent(String prompt) {
                if (apiKey == null || apiKey.isBlank()) {
                        log.warn("Gemini API key not configured");
                        return null;
                }

                try {
                        // Gemini API expects: { "contents": [{ "parts": [{ "text": "..." }] }] }
                        Map<String, Object> part = Map.of("text", prompt);
                        Map<String, Object> content = Map.of("parts", List.of(part));
                        Map<String, Object> payload = Map.of("contents", List.of(content));

                        String body = objectMapper.writeValueAsString(payload);

                        // Endpoint:
                        // https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
                        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model.trim()
                                        + ":generateContent?key=" + apiKey.trim();
                        log.info("Gemini Request URL: https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent",
                                        model.trim());

                        Request request = new Request.Builder()
                                        .url(url)
                                        .post(RequestBody.create(body, MediaType.parse("application/json")))
                                        .build();

                        try (Response response = httpClient.newCall(request).execute()) {
                                if (!response.isSuccessful()) {
                                        String errBody = response.body() != null ? response.body().string() : "No body";
                                        log.error("Gemini error: {} - {}", response.code(), errBody);
                                        return null;
                                }
                                String responseBody = response.body().string();
                                JsonNode json = objectMapper.readTree(responseBody);

                                // Response structure: { "candidates": [{ "content": { "parts": [{ "text": "..."
                                // }] } }] }
                                String text = json.path("candidates")
                                                .get(0)
                                                .path("content")
                                                .path("parts")
                                                .get(0)
                                                .path("text")
                                                .asText();
                                return cleanJsonResponse(text);
                        }
                } catch (Exception e) {
                        log.error("Gemini request failed: {}", e.getMessage());
                        return null;
                }
        }

        private String cleanJsonResponse(String text) {
                if (text == null)
                        return null;
                String cleaned = text.trim();
                if (cleaned.startsWith("```")) {
                        cleaned = cleaned.replaceAll("^```[a-z]*\\n", "");
                        cleaned = cleaned.replaceAll("\\n```$", "");
                }
                return cleaned.trim();
        }

        public String evaluateInterviewAnswer(String question, String answer, String category) {
                String prompt = String.format(
                                "You are an expert interview coach. Evaluate the following interview answer for a %s question.\n"
                                                +
                                                "Question: %s\n" +
                                                "Answer: %s\n\n" +
                                                "Provide your evaluation in strict JSON format with these fields:\n" +
                                                "{\n" +
                                                "  \"score\": <a number from 0 to 10>,\n" +
                                                "  \"feedback\": \"<short summary feedback>\",\n" +
                                                "  \"strengths\": [\"<strength 1>\", \"<strength 2>\"],\n" +
                                                "  \"improvements\": [\"<improvement 1>\", \"<improvement 2>\"]\n" +
                                                "}\n" +
                                                "Return ONLY the JSON. No other text.",
                                category, question, answer);

                return generateContent(prompt);
        }

        public String analyzeAts(String resumeText, String jobDescription) {
                String prompt = String.format(
                                "You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume against the job description.\n"
                                                +
                                                "Resume:\n%s\n\n" +
                                                "Job Description:\n%s\n\n" +
                                                "Return a JSON response with this exact structure:\n" +
                                                "{\n" +
                                                "  \"overallScore\": <0-100>,\n" +
                                                "  \"keywordScore\": <0-100>,\n" +
                                                "  \"sectionScore\": <0-100>,\n" +
                                                "  \"formattingScore\": <0-100>,\n" +
                                                "  \"readabilityScore\": <0-100>,\n" +
                                                "  \"experienceScore\": <0-100>,\n" +
                                                "  \"matchedKeywords\": [\"keyword1\", \"keyword2\"],\n" +
                                                "  \"missingKeywords\": [\"keyword1\", \"keyword2\"],\n" +
                                                "  \"suggestions\": [\"suggestion1\", \"suggestion2\"],\n" +
                                                "  \"formattingWarnings\": [\"warning1\", \"warning2\"]\n" +
                                                "}\n" +
                                                "Return ONLY the JSON. No other text.",
                                resumeText, jobDescription);
                return generateContent(prompt);
        }

        public String parseResumeText(String text) {
                String prompt = String.format(
                                "You are a professional resume parser. Extract structured information from the provided resume text.\n"
                                                +
                                                "Text:\n%s\n\n" +
                                                "Return it as JSON matching this structure (use null for missing fields):\n"
                                                +
                                                "{\n" +
                                                "  \"title\": \"A short, descriptive title\",\n" +
                                                "  \"fullName\": \"...\", \"email\": \"...\", \"phone\": \"...\", \"location\": \"...\", \"website\": \"...\", \"linkedin\": \"...\", \"github\": \"...\",\n"
                                                +
                                                "  \"summary\": \"...\",\n" +
                                                "  \"experiences\": [{\"company\": \"...\", \"title\": \"...\", \"location\": \"...\", \"startDate\": \"...\", \"endDate\": \"...\", \"current\": false, \"bullets\": [\"...\"]}],\n"
                                                +
                                                "  \"educations\": [{\"institution\": \"...\", \"degree\": \"...\", \"fieldOfStudy\": \"...\", \"startDate\": \"...\", \"endDate\": \"...\", \"current\": false}],\n"
                                                +
                                                "  \"skills\": [{\"name\": \"...\", \"level\": \"BEGINNER|INTERMEDIATE|EXPERT\"}],\n"
                                                +
                                                "  \"projects\": [{\"name\": \"...\", \"role\": \"...\", \"startDate\": \"...\", \"endDate\": \"...\", \"url\": \"...\", \"description\": \"...\"}],\n"
                                                +
                                                "  \"certifications\": [{\"name\": \"...\", \"issuer\": \"...\", \"issueDate\": \"...\", \"expiryDate\": \"...\", \"credentialUrl\": \"...\"}],\n"
                                                +
                                                "  \"languages\": [{\"name\": \"...\", \"proficiency\": \"BEGINNER|INTERMEDIATE|PROFESSIONAL|NATIVE\"}]\n"
                                                +
                                                "}\n" +
                                                "Ensure all date strings are human-readable (e.g. \"Jan 2022\"). Return ONLY the JSON. No other text.",
                                text);
                return generateContent(prompt);
        }

        public String generateResumeSummary(String resumeContext) {
                return generateContent(
                                "You are an expert resume writer. Generate a very short, punchy, professional summary in 1-2 short sentences maximum for this profile:\n"
                                                + resumeContext);
        }

        public String rewriteBullet(String bullet, String jobContext) {
                return generateContent("Rewrite this experience bullet point using the STAR method for a " + jobContext
                                + " position. Be specific and quantify results:\n" + bullet);
        }

        public String generateCoverLetter(String resumeContext, String jobDescription) {
                return generateContent(
                                "Write a professional cover letter based on this candidate info and job description:\n\nCandidate:\n"
                                                + resumeContext + "\n\nJob:\n" + jobDescription);
        }

        public String suggestSkills(String currentSkills, String targetRole) {
                return generateContent("Current skills: " + currentSkills + "\nTarget role: " + targetRole
                                + "\nSuggest 5-10 additional relevant skills. Return as a simple list.");
        }
}
