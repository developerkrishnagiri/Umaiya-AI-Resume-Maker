package com.aicareer.repository;

import com.aicareer.entity.Application;
import com.aicareer.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {
    List<Application> findByUserId(String userId);
    Optional<Application> findByUserIdAndJobId(String userId, String jobId);
    boolean existsByUserIdAndJobId(String userId, String jobId);
    List<Application> findByJobId(String jobId);
    Page<Application> findByJobId(String jobId, Pageable pageable);
    long countByUserId(String userId);
    long countByJobId(String jobId);
    long countByStatus(ApplicationStatus status);
}
