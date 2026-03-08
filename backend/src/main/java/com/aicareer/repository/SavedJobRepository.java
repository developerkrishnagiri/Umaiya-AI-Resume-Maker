package com.aicareer.repository;

import com.aicareer.entity.SavedJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, String> {
    List<SavedJob> findByUserId(String userId);
    Optional<SavedJob> findByUserIdAndJobId(String userId, String jobId);
    boolean existsByUserIdAndJobId(String userId, String jobId);
    void deleteByUserIdAndJobId(String userId, String jobId);
}
