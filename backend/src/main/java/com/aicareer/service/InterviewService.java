package com.aicareer.service;

import com.aicareer.entity.*;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InterviewService {

    private final InterviewSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Map<String, List<String>> QUESTION_BANK = Map.of(
            "behavioral", List.of(
                    "Tell me about yourself.",
                    "Describe a challenging project you worked on and how you handled it.",
                    "Give an example of when you had to work with a difficult team member.",
                    "Tell me about a time you failed and what you learned from it.",
                    "How do you handle competing deadlines and priorities?",
                    "Describe a situation where you showed leadership.",
                    "Tell me about your greatest professional achievement.",
                    "How do you handle feedback and criticism?"),
            "technical", List.of(
                    "What is the difference between REST and GraphQL?",
                    "Explain the SOLID principles.",
                    "What are design patterns, and give examples?",
                    "Describe the CAP theorem.",
                    "How does garbage collection work in Java?",
                    "Explain SQL vs NoSQL databases.",
                    "What is a microservice architecture?",
                    "How do you ensure code quality in a team?"),
            "hr", List.of(
                    "Why are you interested in this role?",
                    "Where do you see yourself in 5 years?",
                    "What are your greatest strengths?",
                    "What is your biggest weakness?",
                    "Why are you leaving your current job?",
                    "What are your salary expectations?",
                    "How do you stay motivated?",
                    "Tell me about your work style."),
            "situational", List.of(
                    "What would you do if you disagreed with your manager's decision?",
                    "How would you handle a situation where a project deadline is impossible to meet?",
                    "What would you do if a colleague wasn't doing their fair share?",
                    "How would you prioritize tasks if everything is urgent?",
                    "What would you do if you made a mistake that affected the team?"));

    public List<String> getQuestions(String category, int limit) {
        String cat = category != null ? category.toLowerCase() : "behavioral";
        List<String> questions = new ArrayList<>(QUESTION_BANK.getOrDefault(cat, QUESTION_BANK.get("behavioral")));
        Collections.shuffle(questions);
        return questions.subList(0, Math.min(limit, questions.size()));
    }

    public InterviewSession startSession(String userId, String category, String difficulty) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        List<String> questions = getQuestions(category, 5);
        List<Map<String, Object>> qas = new ArrayList<>();
        for (String q : questions) {
            Map<String, Object> qa = new HashMap<>();
            qa.put("question", q);
            qa.put("answer", null);
            qa.put("feedback", null);
            qa.put("score", null);
            qas.add(qa);
        }

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .category(category != null ? category : "behavioral")
                .difficulty(difficulty != null ? difficulty : "medium")
                .questionsAndAnswers(qas)
                .status("IN_PROGRESS")
                .build();

        return sessionRepository.save(session);
    }

    public InterviewSession submitAnswer(String sessionId, int questionIndex, String answer) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException("Session not found", HttpStatus.NOT_FOUND));

        List<Map<String, Object>> qas = session.getQuestionsAndAnswers();
        if (questionIndex >= qas.size()) {
            throw new ApiException("Invalid question index", HttpStatus.BAD_REQUEST);
        }

        Map<String, Object> qa = new HashMap<>(qas.get(questionIndex));
        String question = (String) qa.get("question");
        String aiEval = geminiService.evaluateInterviewAnswer(question, answer, session.getCategory());

        try {
            JsonNode node = objectMapper.readTree(aiEval);
            qa.put("answer", answer);
            qa.put("score", node.path("score").asDouble(7));
            qa.put("feedback", node.path("feedback").asText("Good answer."));
            qa.put("strengths", node.path("strengths").toString());
            qa.put("improvements", node.path("improvements").toString());
        } catch (Exception e) {
            qa.put("answer", answer);
            qa.put("score", 7.0);
            qa.put("feedback", "Good answer! Consider adding more specific examples.");
        }

        qas.set(questionIndex, qa);
        session.setQuestionsAndAnswers(qas);

        // Check if all answered
        boolean allAnswered = qas.stream().allMatch(q -> q.get("answer") != null);
        if (allAnswered) {
            double avg = qas.stream()
                    .mapToDouble(q -> q.get("score") != null ? ((Number) q.get("score")).doubleValue() : 0)
                    .average().orElse(7);
            session.setOverallScore(BigDecimal.valueOf(avg));
            session.setStatus("COMPLETED");
        }

        return sessionRepository.save(session);
    }

    public List<InterviewSession> getUserSessions(String userId) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public InterviewSession getSession(String sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException("Session not found", HttpStatus.NOT_FOUND));
    }

    public void deleteSession(String sessionId, String userId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ApiException("Session not found", HttpStatus.NOT_FOUND));
        if (!session.getUser().getId().equals(userId)) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }
        sessionRepository.delete(session);
    }
}
