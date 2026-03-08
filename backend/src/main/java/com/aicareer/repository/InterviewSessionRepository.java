package com.aicareer.repository;

import com.aicareer.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, String> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(String userId);
    List<InterviewSession> findByUserIdAndCategory(String userId, String category);
    long countByUserId(String userId);
}
