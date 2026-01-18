package com.omkar.uni.verse.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

public class FileExtensionValidator implements ConstraintValidator<ValidFileExtension, MultipartFile> {

    private List<String> extensions;

    @Override
    public void initialize(ValidFileExtension constraint) {
        extensions = Arrays.asList(constraint.extensions());
    }

    @Override
    public boolean isValid(MultipartFile file, ConstraintValidatorContext constraintValidatorContext) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String fileName = file.getOriginalFilename();
        if (Objects.requireNonNull(fileName).isEmpty() || fileName.isBlank()) {
            return false;
        }

        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return extensions.contains(extension);
    }
}
