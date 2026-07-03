package com.ADP.peerConnect.model.dto.request.Auth;


import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Registration request DTO
 */
@Data
public class Register {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    // --- FIELD UPDATED ---
    @NotNull(message = "College ID is required")
    private Long collegeId;

    @NotBlank(message = "Branch is required")
    private String branch;

    @NotNull(message = "Graduation year is required")
    @Min(value = 2020, message = "Graduation year must be at least 2020")
    @Max(value = 2030, message = "Graduation year must not exceed 2030")
    private Integer graduationYear;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
}