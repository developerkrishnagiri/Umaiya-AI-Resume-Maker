package com.aicareer.service;

import com.aicareer.entity.*;
import com.aicareer.enums.ApplicationStatus;
import com.aicareer.enums.JobType;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JobService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final SavedJobRepository savedJobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;

    public Page<Job> searchJobs(String keyword, String location, String jobType,
            Double minSalary, Double maxSalary, String industry,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        JobType jt = null;
        if (jobType != null && !jobType.isBlank()) {
            try {
                jt = JobType.valueOf(jobType.toUpperCase());
            } catch (Exception ignored) {
            }
        }
        return jobRepository.searchJobs(
                keyword, location, jt,
                minSalary != null ? BigDecimal.valueOf(minSalary) : null,
                maxSalary != null ? BigDecimal.valueOf(maxSalary) : null,
                industry, pageable);
    }

    public Job getJobById(String id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ApiException("Job not found", HttpStatus.NOT_FOUND));
    }

    public Job createJob(String recruiterId, Job job) {
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new ApiException("Recruiter not found", HttpStatus.NOT_FOUND));
        job.setRecruiter(recruiter);
        job.setStatus("ACTIVE");
        job.setApplicationCount(0);
        return jobRepository.save(job);
    }

    public Job updateJob(String jobId, String recruiterId, Job jobData) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", HttpStatus.NOT_FOUND));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new ApiException("Unauthorized", HttpStatus.FORBIDDEN);
        }
        if (jobData.getTitle() != null)
            job.setTitle(jobData.getTitle());
        if (jobData.getDescription() != null)
            job.setDescription(jobData.getDescription());
        if (jobData.getLocation() != null)
            job.setLocation(jobData.getLocation());
        if (jobData.getSalaryMin() != null)
            job.setSalaryMin(jobData.getSalaryMin());
        if (jobData.getSalaryMax() != null)
            job.setSalaryMax(jobData.getSalaryMax());
        if (jobData.getStatus() != null)
            job.setStatus(jobData.getStatus());
        if (jobData.getRequirements() != null)
            job.setRequirements(jobData.getRequirements());
        if (jobData.getBenefits() != null)
            job.setBenefits(jobData.getBenefits());
        if (jobData.getKeywords() != null)
            job.setKeywords(jobData.getKeywords());
        return jobRepository.save(job);
    }

    public void deleteJob(String jobId, String recruiterId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException("Job not found", HttpStatus.NOT_FOUND));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new ApiException("Unauthorized", HttpStatus.FORBIDDEN);
        }
        jobRepository.delete(job);
    }

    public Application applyForJob(String userId, String jobId, String resumeId, String coverLetter) {
        if (applicationRepository.existsByUserIdAndJobId(userId, jobId)) {
            throw new ApiException("Already applied for this job", HttpStatus.CONFLICT);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Job job = getJobById(jobId);
        Resume resume = resumeId != null ? resumeRepository.findById(resumeId).orElse(null) : null;

        Application app = Application.builder()
                .user(user).job(job).resume(resume)
                .status(ApplicationStatus.APPLIED)
                .coverLetter(coverLetter).build();
        job.setApplicationCount((job.getApplicationCount() != null ? job.getApplicationCount() : 0) + 1);
        jobRepository.save(job);
        return applicationRepository.save(app);
    }

    public void saveJob(String userId, String jobId) {
        if (!savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            User user = userRepository.findById(userId).orElseThrow();
            Job job = getJobById(jobId);
            savedJobRepository.save(SavedJob.builder().user(user).job(job).build());
        }
    }

    public void unsaveJob(String userId, String jobId) {
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
    }

    public List<SavedJob> getSavedJobs(String userId) {
        return savedJobRepository.findByUserId(userId);
    }

    public List<Application> getAppliedJobs(String userId) {
        return applicationRepository.findByUserId(userId);
    }

    public List<Job> getRecruiterJobs(String recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId);
    }

    public Page<Application> getCandidatesForJob(String jobId, String recruiterId, int page, int size) {
        Job job = getJobById(jobId);
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new ApiException("Unauthorized", HttpStatus.FORBIDDEN);
        }
        return applicationRepository.findByJobId(jobId, PageRequest.of(page, size));
    }

    public Application updateApplicationStatus(String appId, String status, String notes) {
        Application app = applicationRepository.findById(appId)
                .orElseThrow(() -> new ApiException("Application not found", HttpStatus.NOT_FOUND));
        app.setStatus(ApplicationStatus.valueOf(status.toUpperCase()));
        if (notes != null)
            app.setRecruiterNotes(notes);
        return applicationRepository.save(app);
    }
}
