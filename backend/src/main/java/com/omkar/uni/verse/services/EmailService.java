package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.entities.user.EmailTemplateName;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Async
    public CompletableFuture<String> sendEmail(
            String from,
            String to,
            String subject,
            String otp,
            EmailTemplateName templateName
    ) throws MessagingException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED,
                    StandardCharsets.UTF_8.name()
            );
            messageHelper.setFrom(from);
            messageHelper.setTo(to);
            messageHelper.setSubject(subject);

            Map<String, Object> properties = new HashMap<>();
            // Prevents XSS via validating otp
            if (!otp.matches("^[0-9A-Z]{8}$")) {
                throw new IllegalArgumentException("Invalid OTP format");
            }
            properties.put("otp", otp);

            Context context = new Context();
            context.setVariables(properties);
            String template = templateEngine.process(templateName.getName(), context);
            messageHelper.setText(template, true);
            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);
            return CompletableFuture.completedFuture("Success");
        } catch (Exception e) {
            log.error("❌ Failed to send verification email to: {}. Error: {}", to, e.getMessage(), e);
            log.error("   Error type: {}", e.getClass().getSimpleName());
            log.error("   Check: 1) Gmail App Password configured? 2) MAIL_ID and MAIL_PASSWORD set? 3) Spam folder?");
            return CompletableFuture.completedFuture("Error");
        }
    }
}
