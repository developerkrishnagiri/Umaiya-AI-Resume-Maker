package com.aicareer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(String to, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String html = """
                <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:white;margin:0;font-size:24px;">AI Career Platform</h1>
                  </div>
                  <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;">
                    <h2 style="color:#1f2937;">Verify your email, %s!</h2>
                    <p style="color:#6b7280;">Click the button below to verify your email and activate your account.</p>
                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
                      Verify Email Address
                    </a>
                    <p style="color:#9ca3af;font-size:13px;">This link expires in 24 hours. If you didn't register, ignore this email.</p>
                  </div>
                </div>
                """
                .formatted(name, link);
        sendHtml(to, "Verify your AI Career Platform account", html);
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = """
                <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;">
                  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;border-radius:12px 12px 0 0;">
                    <h1 style="color:white;margin:0;font-size:24px;">AI Career Platform</h1>
                  </div>
                  <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;">
                    <h2 style="color:#1f2937;">Reset your password, %s</h2>
                    <p style="color:#6b7280;">We received a request to reset your password.</p>
                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#ef4444,#f97316);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
                      Reset Password
                    </a>
                    <p style="color:#9ca3af;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
                  </div>
                </div>
                """
                .formatted(name, link);
        sendHtml(to, "Reset your AI Career Platform password", html);
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "AI Career Platform");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
