package com.omkar.uni.verse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EmailController {
    private final JavaMailSender javaMailSender;

    @RequestMapping("/send-email")
    public String sendEmail() {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("from.uni.verse.dev@gmail.com");
        message.setTo("omkarpadalkar21@gmail.com");
        message.setSubject("Simple test message from UniVerse");
        message.setText("Hello from Universe");
        javaMailSender.send(message);
        return "success";
    }
}
