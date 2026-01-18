package com.omkar.uni.verse.domain.dto.user;

import com.omkar.uni.verse.validators.ValidFileExtension;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class VerifyOrganizerRequest {
    @NotEmpty(message = "Email is mandatory")
    @NotBlank(message = "Email is mandatory")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^[0-9]{8}$", message = "OTP must be 8  characters")
    private String otp;

    @ValidFileExtension(extensions = {"pdf", "jpeg", "png", "jpg"})
    private MultipartFile verificationDocument;

}
