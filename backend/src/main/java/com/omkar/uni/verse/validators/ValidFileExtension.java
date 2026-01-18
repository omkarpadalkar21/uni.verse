package com.omkar.uni.verse.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FileExtensionValidator.class)
public @interface ValidFileExtension {
    String message() default "Invalid file extension";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    String[] extensions();
}
