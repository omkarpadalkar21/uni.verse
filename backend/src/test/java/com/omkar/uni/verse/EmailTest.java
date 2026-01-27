package com.omkar.uni.verse;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@SpringBootTest
public class EmailTest {
    @Autowired
    private JavaMailSender javaMailSender;


    @Test
    public void sendEmail() {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("from.uni.verse.dev@gmail.com");
        message.setTo("omkarpadalkar21@gmail.com");
        message.setSubject("Simple test message from UniVerse");
        message.setText("Hello from Universe");
        javaMailSender.send(message);
    }

    @Test
    public void sendEmailWithAttachments() throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom("from.uni.verse.dev@gmail.com");
        helper.setTo("omkarpadalkar21@gmail.com");
        helper.setSubject("Mail with attachment from UniVerse");
        helper.setText("Hello from Universe");
        helper.addAttachment("logo.svg", new File("/home/caffeine/Desktop/Progata/Projects/uni.verse/frontend/public/logo.svg"));
        javaMailSender.send(message);
    }

    @Test
    public void sendEmailWithOtp() throws MessagingException, IOException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom("from.uni.verse.dev@gmail.com");
        helper.setTo("omkarpadalkar21@gmail.com");
        helper.setSubject("Mail with attachment from UniVerse");
        helper.setText(
                new String(Objects.requireNonNull(EmailTest.class.getResourceAsStream("/templates/verify_account.html")).readAllBytes(), StandardCharsets.UTF_8),
                true
        );
        javaMailSender.send(message);
    }
}
