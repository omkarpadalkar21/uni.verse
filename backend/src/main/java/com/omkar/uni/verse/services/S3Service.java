package com.omkar.uni.verse.services;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface S3Service {
    String uploadVerificationDocument(MultipartFile file, String userId) throws IOException;

    byte[] getVerificationDocument(String key);
}
