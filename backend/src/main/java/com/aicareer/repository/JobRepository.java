package com.aicareer.repository;

import com.aicareer.entity.Job;
import com.aicareer.enums.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, String> {
    List<Job> findByRecruiterId(String recruiterId);

    @Query("""
        SELECT j FROM Job j WHERE j.status = 'ACTIVE'
        AND (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%'))
             OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%')))
        AND (:jobType IS NULL OR j.jobType = :jobType)
        AND (:minSalary IS NULL OR j.salaryMin >= :minSalary)
        AND (:maxSalary IS NULL OR j.salaryMax <= :maxSalary)
        AND (:industry IS NULL OR LOWER(j.industry) LIKE LOWER(CONCAT('%', :industry, '%')))
        ORDER BY j.createdAt DESC
    """)
    Page<Job> searchJobs(
        @Param("keyword") String keyword,
        @Param("location") String location,
        @Param("jobType") JobType jobType,
        @Param("minSalary") BigDecimal minSalary,
        @Param("maxSalary") BigDecimal maxSalary,
        @Param("industry") String industry,
        Pageable pageable
    );

    long countByRecruiterId(String recruiterId);
    long countByStatus(String status);
}
