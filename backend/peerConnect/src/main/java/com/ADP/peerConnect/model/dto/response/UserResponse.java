package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private CollegeResponse college;
    private Role role;
    private String branch;
    private Integer graduationYear;
    private AvailabilityStatus availabilityStatus;
    private String profilePictureUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;


    public UserResponse(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.availabilityStatus = user.getAvailabilityStatus();
        this.bio = user.getBio();
        this.role = user.getRole();
        this.branch = user.getBranch();
        this.githubUrl = user.getGithubUrl();
        this.graduationYear = user.getGraduationYear();
        this.linkedinUrl = user.getLinkedinUrl();
        this.portfolioUrl = user.getPortfolioUrl();
        this.profilePictureUrl = user.getProfilePictureUrl();
        this.college = user.getCollege() != null
                ? new CollegeResponse(user.getCollege())
                : null;
    }

    public UserResponse(String id, String email, String firstName, String lastName) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}