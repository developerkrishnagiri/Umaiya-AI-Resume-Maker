package com.aicareer.service;

import com.aicareer.entity.*;
import com.aicareer.exception.ApiException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeImportService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Resume parseFile(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null)
            throw new ApiException("Invalid file", HttpStatus.BAD_REQUEST);

        String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        String text = "";

        try (InputStream is = file.getInputStream()) {
            if ("pdf".equals(ext)) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    text = new PDFTextStripper().getText(doc);
                }
            } else if ("docx".equals(ext)) {
                try (XWPFDocument doc = new XWPFDocument(is)) {
                    XWPFWordExtractor extractor = new XWPFWordExtractor(doc);
                    text = extractor.getText();
                }
            } else if ("doc".equals(ext)) {
                try (HWPFDocument doc = new HWPFDocument(is)) {
                    WordExtractor extractor = new WordExtractor(doc);
                    text = extractor.getText();
                }
            } else {
                throw new ApiException("Unsupported format: " + ext, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            log.error("File extraction failed", e);
            throw new ApiException("Failed to read file content", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (text.isBlank())
            throw new ApiException("No text found in file", HttpStatus.BAD_REQUEST);

        try {
            String aiJson = geminiService.parseResumeText(text);
            Resume resume = objectMapper.readValue(aiJson, Resume.class);

            // Link nested objects
            if (resume.getExperiences() != null)
                resume.getExperiences().forEach(e -> e.setResume(resume));
            if (resume.getEducations() != null)
                resume.getEducations().forEach(e -> e.setResume(resume));
            if (resume.getSkills() != null)
                resume.getSkills().forEach(s -> s.setResume(resume));
            if (resume.getProjects() != null)
                resume.getProjects().forEach(p -> p.setResume(resume));
            if (resume.getCertifications() != null)
                resume.getCertifications().forEach(c -> c.setResume(resume));
            if (resume.getLanguages() != null)
                resume.getLanguages().forEach(l -> l.setResume(resume));

            return resume;
        } catch (Exception e) {
            log.error("AI parsing failed", e);
            throw new ApiException("Failed to structure resume data", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
