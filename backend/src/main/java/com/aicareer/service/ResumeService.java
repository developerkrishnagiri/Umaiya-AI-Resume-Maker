package com.aicareer.service;

import com.aicareer.entity.*;
import com.aicareer.exception.ApiException;
import com.aicareer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeImportService resumeImportService;

    public List<Resume> getUserResumes(String userId) {
        return resumeRepository.findByUserId(userId);
    }

    public Resume getResumeById(String resumeId, String userId) {
        return resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ApiException("Resume not found", HttpStatus.NOT_FOUND));
    }

    public Resume createResume(String userId, Resume resumeData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        resumeData.setUser(user);
        resumeData.setIsDraft(true);
        return resumeRepository.save(resumeData);
    }

    public Resume updateResume(String resumeId, String userId, Resume resumeData) {
        Resume existing = getResumeById(resumeId, userId);

        if (resumeData.getTitle() != null)
            existing.setTitle(resumeData.getTitle());
        if (resumeData.getTemplateId() != null)
            existing.setTemplateId(resumeData.getTemplateId());
        if (resumeData.getSummary() != null)
            existing.setSummary(resumeData.getSummary());
        if (resumeData.getFullName() != null)
            existing.setFullName(resumeData.getFullName());
        if (resumeData.getEmail() != null)
            existing.setEmail(resumeData.getEmail());
        if (resumeData.getPhone() != null)
            existing.setPhone(resumeData.getPhone());
        if (resumeData.getLocation() != null)
            existing.setLocation(resumeData.getLocation());
        if (resumeData.getWebsite() != null)
            existing.setWebsite(resumeData.getWebsite());
        if (resumeData.getLinkedin() != null)
            existing.setLinkedin(resumeData.getLinkedin());
        if (resumeData.getGithub() != null)
            existing.setGithub(resumeData.getGithub());
        if (resumeData.getIsDraft() != null)
            existing.setIsDraft(resumeData.getIsDraft());
        if (resumeData.getSectionOrder() != null)
            existing.setSectionOrder(resumeData.getSectionOrder());
        if (resumeData.getTargetJobTitle() != null)
            existing.setTargetJobTitle(resumeData.getTargetJobTitle());

        // Update nested collections
        if (resumeData.getExperiences() != null) {
            existing.getExperiences().clear();
            resumeData.getExperiences().forEach(e -> e.setResume(existing));
            existing.getExperiences().addAll(resumeData.getExperiences());
        }
        if (resumeData.getEducations() != null) {
            existing.getEducations().clear();
            resumeData.getEducations().forEach(e -> e.setResume(existing));
            existing.getEducations().addAll(resumeData.getEducations());
        }
        if (resumeData.getSkills() != null) {
            existing.getSkills().clear();
            resumeData.getSkills().forEach(s -> s.setResume(existing));
            existing.getSkills().addAll(resumeData.getSkills());
        }
        if (resumeData.getProjects() != null) {
            existing.getProjects().clear();
            resumeData.getProjects().forEach(p -> p.setResume(existing));
            existing.getProjects().addAll(resumeData.getProjects());
        }
        if (resumeData.getCertifications() != null) {
            existing.getCertifications().clear();
            resumeData.getCertifications().forEach(c -> c.setResume(existing));
            existing.getCertifications().addAll(resumeData.getCertifications());
        }
        if (resumeData.getLanguages() != null) {
            existing.getLanguages().clear();
            resumeData.getLanguages().forEach(l -> l.setResume(existing));
            existing.getLanguages().addAll(resumeData.getLanguages());
        }

        return resumeRepository.save(existing);
    }

    public void deleteResume(String resumeId, String userId) {
        Resume resume = getResumeById(resumeId, userId);
        resumeRepository.delete(resume);
    }

    public Resume duplicateResume(String resumeId, String userId) {
        Resume original = getResumeById(resumeId, userId);

        Resume copy = Resume.builder()
                .user(original.getUser())
                .title(original.getTitle() + " (Copy)")
                .templateId(original.getTemplateId())
                .isDraft(true)
                .fullName(original.getFullName())
                .email(original.getEmail())
                .phone(original.getPhone())
                .location(original.getLocation())
                .website(original.getWebsite())
                .linkedin(original.getLinkedin())
                .github(original.getGithub())
                .summary(original.getSummary())
                .sectionOrder(original.getSectionOrder())
                .build();

        // Copy nested collections
        if (original.getExperiences() != null) {
            original.getExperiences().forEach(e -> {
                Experience expCopy = Experience.builder()
                        .company(e.getCompany()).title(e.getTitle()).location(e.getLocation())
                        .startDate(e.getStartDate()).endDate(e.getEndDate()).current(e.getCurrent())
                        .description(e.getDescription()).bullets(e.getBullets()).displayOrder(e.getDisplayOrder())
                        .resume(copy).build();
                copy.getExperiences().add(expCopy);
            });
        }
        if (original.getEducations() != null) {
            original.getEducations().forEach(ed -> {
                Education eduCopy = Education.builder()
                        .institution(ed.getInstitution()).degree(ed.getDegree()).fieldOfStudy(ed.getFieldOfStudy())
                        .startDate(ed.getStartDate()).endDate(ed.getEndDate()).current(ed.getCurrent())
                        .gpa(ed.getGpa()).location(ed.getLocation()).description(ed.getDescription())
                        .displayOrder(ed.getDisplayOrder()).resume(copy).build();
                copy.getEducations().add(eduCopy);
            });
        }
        if (original.getSkills() != null) {
            original.getSkills().forEach(s -> {
                Skill skillCopy = Skill.builder()
                        .name(s.getName()).category(s.getCategory()).level(s.getLevel())
                        .displayOrder(s.getDisplayOrder()).resume(copy).build();
                copy.getSkills().add(skillCopy);
            });
        }
        if (original.getProjects() != null) {
            original.getProjects().forEach(p -> {
                Project proCopy = Project.builder()
                        .name(p.getName()).role(p.getRole()).startDate(p.getStartDate()).endDate(p.getEndDate())
                        .url(p.getUrl()).repoUrl(p.getRepoUrl()).description(p.getDescription())
                        .technologies(p.getTechnologies()).displayOrder(p.getDisplayOrder()).resume(copy).build();
                copy.getProjects().add(proCopy);
            });
        }
        if (original.getCertifications() != null) {
            original.getCertifications().forEach(c -> {
                Certification certCopy = Certification.builder()
                        .name(c.getName()).issuer(c.getIssuer()).issueDate(c.getIssueDate())
                        .expiryDate(c.getExpiryDate()).credentialUrl(c.getCredentialUrl()).resume(copy).build();
                copy.getCertifications().add(certCopy);
            });
        }
        if (original.getLanguages() != null) {
            original.getLanguages().forEach(l -> {
                Language langCopy = Language.builder()
                        .name(l.getName()).proficiency(l.getProficiency()).resume(copy).build();
                copy.getLanguages().add(langCopy);
            });
        }

        return resumeRepository.save(copy);
    }

    public long countUserResumes(String userId) {
        return resumeRepository.countByUserId(userId);
    }

    public Resume importResume(String userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeImportService.parseFile(file);
        resume.setUser(user);
        resume.setIsDraft(true);
        if (resume.getTitle() == null || resume.getTitle().isBlank()) {
            resume.setTitle("Imported Resume: "
                    + (file.getOriginalFilename() != null ? file.getOriginalFilename() : "Untitled"));
        }

        return resumeRepository.save(resume);
    }
}
