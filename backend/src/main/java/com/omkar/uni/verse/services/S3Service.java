package com.omkar.uni.verse.services;

import com.omkar.uni.verse.domain.dto.admin.S3ObjectInputStreamWrapper;
import com.omkar.uni.verse.domain.entities.admin.AccessType;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.http.SdkHttpMethod;

import java.io.IOException;

public interface S3Service {
    String uploadVerificationDocument(MultipartFile file, String userId) throws IOException;

    String generatePreSignedUrl(String filePath, SdkHttpMethod httpMethod, AccessType accessType);

    String generateGetPreSignedUrl(String filePath);

    String generatePutPreSignedUrl(String filePath, AccessType accessType);

    S3ObjectInputStreamWrapper downloadFile(String fileName);
}
