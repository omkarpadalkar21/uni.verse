package com.omkar.uni.verse.domain.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponseDto {

    private String message;
    private String code;
    private LocalDateTime timestamp = LocalDateTime.now();
    private String path;
    private Integer status;
    private Map<String, String> details;

    public ErrorResponseDto(String message, String code) {
        this.message = message;
        this.code = code;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponseDto(String message, String code, Integer status) {
        this.message = message;
        this.code = code;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponseDto(String message, String code, Integer status, String path) {
        this.message = message;
        this.code = code;
        this.status = status;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponseDto(String message, String code, Integer status, String path, Map<String, String> details) {
        this.message = message;
        this.code = code;
        this.status = status;
        this.path = path;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}



