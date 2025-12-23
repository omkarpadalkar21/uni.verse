package com.omkar.uni.verse.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public String sendVerificationEmail(
            String from,
            String to,
            String subject,
            String otp
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
            properties.put("otp", otp);

            Context context = new Context();
            context.setVariables(properties);
            String template = templateEngine.process("otp-verification", context);
            messageHelper.setText(template, true);
            mailSender.send(message);
            return "Success";
        } catch (MessagingException me) {
            log.error("Error sending verification email, error: {}", me.getMessage());
            return "Error";
        }
    }
}
