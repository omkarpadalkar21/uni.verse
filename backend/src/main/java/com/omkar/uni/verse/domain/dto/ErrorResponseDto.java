package com.omkar.uni.verse.domain.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ErrorResponseDto {

    private String message;
    private String code;
    private LocalDateTime timestamp = LocalDateTime.now();

    public ErrorResponseDto(String message, String code) {
        this.message = message;
        this.code = code;
        this.timestamp = LocalDateTime.now();
    }
}


