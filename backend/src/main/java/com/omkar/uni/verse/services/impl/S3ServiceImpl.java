package com.omkar.uni.verse.services.impl;

import com.omkar.uni.verse.services.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.private_bucket.name}")
    private String privateBucketName;

    @Override
    public String uploadVerificationDocument(MultipartFile file, String userId) throws IOException {
        // Generate unique key: verifications/{userId}/{timestamp}_{originalFilename}
        String timestamp = String.valueOf(System.currentTimeMillis());
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String key = String.format("verifications/%s/%s%s", userId, timestamp, fileExtension);

        // Build PutObjectRequest with metadata
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(privateBucketName)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        // Upload to S3
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        // Return the S3 URL (key can be used to retrieve the object later)
        return key;
    }

    @Override
    public byte[] getVerificationDocument(String key) {
        return new byte[0];
    }
}
