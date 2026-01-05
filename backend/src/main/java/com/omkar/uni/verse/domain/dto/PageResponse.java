package com.omkar.uni.verse.domain.dto;

import java.util.List;

public record PageResponse<T>(
        List<T> content,
        int totalPages
) {
}
