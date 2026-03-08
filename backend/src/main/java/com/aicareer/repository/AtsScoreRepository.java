package com.aicareer.repository;

import com.aicareer.entity.AtsScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtsScoreRepository extends JpaRepository<AtsScore, String> {
    List<AtsScore> findByResumeId(String resumeId);
    List<AtsScore> findByResumeIdOrderByCreatedAtDesc(String resumeId);
}
