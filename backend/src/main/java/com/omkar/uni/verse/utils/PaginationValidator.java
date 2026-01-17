package com.omkar.uni.verse.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Utility class for validating and sanitizing pagination parameters.
 * Prevents DoS attacks via memory exhaustion and invalid query parameters.
 */
@Slf4j
public final class PaginationValidator {


    public static final int MAX_PAGE_SIZE = 100;

    public static final int DEFAULT_PAGE_SIZE = 20;

    // Private constructor to prevent instantiation
    private PaginationValidator() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    public static void validatePaginationParams(int offset, int pageSize) {
        if (offset < 0) {
            log.error("Invalid pagination: offset {} is negative", offset);
            throw new IllegalArgumentException("Page offset cannot be negative");
        }
        if (pageSize <= 0) {
            log.error("Invalid pagination: pageSize {} is zero or negative", pageSize);
            throw new IllegalArgumentException("Page size must be greater than 0");
        }
    }

    public static int validateAndLimitPageSize(int pageSize) {
        if (pageSize > MAX_PAGE_SIZE) {
            log.warn("Page size {} exceeds maximum {}, limiting to maximum", pageSize, MAX_PAGE_SIZE);
            return MAX_PAGE_SIZE;
        }
        return pageSize;
    }

    public static PageRequest createValidatedPageRequest(int offset, int pageSize) {
        validatePaginationParams(offset, pageSize);
        int validatedPageSize = validateAndLimitPageSize(pageSize);
        return PageRequest.of(offset, validatedPageSize);
    }

    public static PageRequest createValidatedPageRequest(int offset, int pageSize, Sort sort) {
        validatePaginationParams(offset, pageSize);
        int validatedPageSize = validateAndLimitPageSize(pageSize);
        return PageRequest.of(offset, validatedPageSize, sort);
    }

    public static PageRequest validatePageable(Pageable pageable) {
        if (pageable == null) {
            log.debug("Pageable is null, using default pagination");
            return PageRequest.of(0, DEFAULT_PAGE_SIZE);
        }

        int offset = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();

        validatePaginationParams(offset, pageSize);
        int validatedPageSize = validateAndLimitPageSize(pageSize);

        if (pageable.getSort().isSorted()) {
            return PageRequest.of(offset, validatedPageSize, pageable.getSort());
        }

        return PageRequest.of(offset, validatedPageSize);
    }

    public static boolean isValidPageSize(int pageSize) {
        return pageSize > 0 && pageSize <= MAX_PAGE_SIZE;
    }

    public static boolean isValidOffset(int offset) {
        return offset >= 0;
    }
}
