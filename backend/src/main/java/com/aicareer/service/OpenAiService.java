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
public class OpenAiService {

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.model:gpt-4o}")
    private String model;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String chat(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OpenAI API key not configured — returning mock response");
            return getMockResponse(userMessage);
        }

        try {
            Map<String, Object> payload = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userMessage)),
                    "temperature", 0.7,
                    "max_tokens", 2000);

            String body = objectMapper.writeValueAsString(payload);
            Request request = new Request.Builder()
                    .url("https://api.openai.com/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .post(RequestBody.create(body, MediaType.parse("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errBody = response.body() != null ? response.body().string() : "No body";
                    log.error("OpenAI error: {} - {}", response.code(), errBody);
                    return getMockResponse(userMessage);
                }
                String responseBody = response.body().string();
                JsonNode json = objectMapper.readTree(responseBody);
                return json.path("choices").get(0).path("message").path("content").asText();
            }
        } catch (Exception e) {
            log.error("OpenAI request failed: {}", e.getMessage());
            return getMockResponse(userMessage);
        }
    }

    public String generateResumeSummary(String resumeContext) {
        return chat(
                "You are an expert resume writer. Generate professional, compelling summaries in 3-4 sentences.",
                "Generate a professional summary for:\n" + resumeContext);
    }

    public String rewriteBullet(String bullet, String jobContext) {
        return chat(
                "You are an expert resume writer. Rewrite experience bullets using the STAR method (Situation, Task, Action, Result). Be specific, quantify achievements, use strong action verbs.",
                "Rewrite this bullet point for a " + jobContext + " position:\n" + bullet);
    }

    public String generateCoverLetter(String resumeContext, String jobDescription) {
        return chat(
                "You are a professional career coach and cover letter writer. Write compelling, personalized cover letters that highlight the candidate's best qualifications for the role.",
                "Write a professional cover letter for this candidate and job:\n\nCandidate Info:\n" + resumeContext
                        + "\n\nJob Description:\n" + jobDescription);
    }

    public String analyzeAts(String resumeText, String jobDescription) {
        return chat(
                """
                        You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume against the job description and return a JSON response with this exact structure:
                        {
                          "overallScore": <0-100>,
                          "keywordScore": <0-100>,
                          "sectionScore": <0-100>,
                          "formattingScore": <0-100>,
                          "readabilityScore": <0-100>,
                          "experienceScore": <0-100>,
                          "matchedKeywords": ["keyword1", "keyword2"],
                          "missingKeywords": ["keyword1", "keyword2"],
                          "suggestions": ["suggestion1", "suggestion2"],
                          "formattingWarnings": ["warning1", "warning2"]
                        }
                        Return only the JSON, no other text.
                        """,
                "Resume:\n" + resumeText + "\n\nJob Description:\n" + jobDescription);
    }

    public String evaluateInterviewAnswer(String question, String answer, String category) {
        return chat(
                "You are an expert interview coach. Evaluate the interview answer and provide constructive feedback. Return JSON: {\"score\": <0-10>, \"feedback\": \"...\", \"strengths\": [\"...\"], \"improvements\": [\"...\"]}",
                "Category: " + category + "\nQuestion: " + question + "\nAnswer: " + answer);
    }

    public String suggestSkills(String currentSkills, String targetRole) {
        return chat(
                "You are a career advisor. Suggest relevant skills to add to a resume. Return a JSON array of skill names.",
                "Current skills: " + currentSkills + "\nTarget role: " + targetRole);
    }

    public String parseResumeText(String text) {
        return chat(
                """
                        You are a professional resume parser. Extract structured information from the provided resume text and return it as JSON matching this structure:
                        {
                          "title": "A short, descriptive title for the resume based on the person's profile",
                          "fullName": "...",
                          "email": "...",
                          "phone": "...",
                          "location": "City, State/Country",
                          "website": "...",
                          "linkedin": "...",
                          "github": "...",
                          "summary": "...",
                          "experiences": [
                            {
                              "company": "...",
                              "title": "...",
                              "location": "...",
                              "startDate": "...",
                              "endDate": "...",
                              "current": false,
                              "bullets": ["Point 1", "Point 2"]
                            }
                          ],
                          "educations": [
                            {
                              "institution": "...",
                              "degree": "...",
                              "fieldOfStudy": "...",
                              "startDate": "...",
                              "endDate": "...",
                              "current": false,
                              "gpa": 3.8
                            }
                          ],
                          "skills": [
                            { "name": "Skill Name", "level": "BEGINNER|INTERMEDIATE|EXPERT" }
                          ],
                          "projects": [
                            {
                              "name": "...",
                              "role": "...",
                              "startDate": "...",
                              "endDate": "...",
                              "url": "...",
                              "description": "..."
                            }
                          ],
                          "certifications": [
                            {
                              "name": "...",
                              "issuer": "...",
                              "issueDate": "...",
                              "expiryDate": "...",
                              "credentialUrl": "..."
                            }
                          ],
                          "languages": [
                            { "name": "...", "proficiency": "BEGINNER|INTERMEDIATE|PROFESSIONAL|NATIVE" }
                          ]
                        }

                        Guidelines:
                        1. If a field is missing, use null or an empty array as appropriate.
                        2. For dates, use human-readable formats like "Jan 2022" or "Present".
                        3. For "bullets" in experience, split paragraphs into meaningful individual points.
                        4. For "location" in experience/education, extract it if available.
                        5. Try to infer the most appropriate "level" for skills based on context (e.g., years of use).
                        6. Ensure the result is strictly valid JSON.
                        7. Return ONLY the JSON object. No preamble, no post-text, no markdown code blocks.
                        """,
                "Parse this resume text:\n" + text);
    }

    private String getMockResponse(String userMessage) {
        // Demo mode responses when API key is not configured
        if (userMessage.contains("summary") || userMessage.contains("professional summary")) {
            return "Results-driven software professional with 5+ years of experience delivering scalable, high-performance solutions. Proven track record of leading cross-functional teams and implementing cutting-edge technologies to drive business growth. Passionate about solving complex problems and creating exceptional user experiences.";
        }
        if (userMessage.contains("score") || userMessage.contains("ATS")) {
            return """
                    {
                      "overallScore": 76,
                      "keywordScore": 72,
                      "sectionScore": 85,
                      "formattingScore": 90,
                      "readabilityScore": 80,
                      "experienceScore": 68,
                      "matchedKeywords": ["Java", "Spring Boot", "REST API", "PostgreSQL", "Agile"],
                      "missingKeywords": ["Kubernetes", "CI/CD", "Docker", "Microservices"],
                      "suggestions": [
                        "Add quantifiable achievements to your experience bullets",
                        "Include more industry-specific keywords from the job description",
                        "Add a skills summary section at the top",
                        "Expand your project descriptions with measurable impact"
                      ],
                      "formattingWarnings": [
                        "Avoid using tables — ATS systems may not parse them correctly",
                        "Use standard section headings (Experience, Education, Skills)"
                      ]
                    }
                    """;
        }
        if (userMessage.contains("cover letter")) {
            return "Dear Hiring Manager,\n\nI am excited to apply for this position at your esteemed organization. With my background in software development and a passion for innovation, I am confident I would make a significant contribution to your team.\n\nMy experience includes building scalable backend systems, collaborating in agile environments, and delivering high-quality code under tight deadlines. I have consistently demonstrated the ability to learn quickly and adapt to new challenges.\n\nI would welcome the opportunity to discuss how my skills align with your needs. Thank you for considering my application.\n\nSincerely,\n[Your Name]";
        }
        if (userMessage.contains("evaluate") || userMessage.contains("interview")) {
            return "{\"score\": 7, \"feedback\": \"Good structured answer with clear examples. Could benefit from more quantifiable results.\", \"strengths\": [\"Clear communication\", \"Used specific examples\"], \"improvements\": [\"Add measurable outcomes\", \"Be more concise\"]}";
        }
        if (userMessage.contains("Parse this resume text")) {
            return """
                    {
                      "title": "Imported Resume",
                      "fullName": "John Doe",
                      "email": "john.doe@example.com",
                      "phone": "+1 234 567 890",
                      "location": "New York, NY",
                      "summary": "Experienced software engineer with a focus on web technologies.",
                      "experiences": [
                        { "company": "Tech Corp", "title": "Senior Dev", "startDate": "Jan 2020", "endDate": "Present", "current": true, "bullets": ["Built things", "Managed people"] }
                      ],
                      "skills": [ { "name": "Java", "level": "EXPERT" } ]
                    }
                    """;
        }
        return "AI response generated successfully. Configure OPENAI_API_KEY in your .env file for real AI responses.";
    }
}
