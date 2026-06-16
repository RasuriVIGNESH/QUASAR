package com.ADP.peerConnect.model.dto.request.User;

import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class UpdateUserRequest {

    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    private String branch;
    @Min(value = 2020, message = "Graduation year must be at least 2020")
    @Max(value = 2030, message = "Graduation year must not exceed 2030")
    private Integer graduationYear;
    private AvailabilityStatus availabilityStatus;
    private String profilePictureUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;




}
