package com.ADP.peerConnect.model.dto.request.User;

import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import javax.validation.constraints.*;

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
    private byte[] profilePhoto;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;


    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public @Size(max = 500, message = "Bio must not exceed 500 characters") String getBio() {
        return bio;
    }

    public void setBio(@Size(max = 500, message = "Bio must not exceed 500 characters") String bio) {
        this.bio = bio;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters") String getFirstName() {
        return firstName;
    }

    public void setFirstName(@Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters") String firstName) {
        this.firstName = firstName;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public @Min(value = 2020, message = "Graduation year must be at least 2020") @Max(value = 2030, message = "Graduation year must not exceed 2030") Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(@Min(value = 2020, message = "Graduation year must be at least 2020") @Max(value = 2030, message = "Graduation year must not exceed 2030") Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters") String getLastName() {
        return lastName;
    }

    public void setLastName(@Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters") String lastName) {
        this.lastName = lastName;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public byte[] getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(byte[] profilePhoto) {
        this.profilePhoto = profilePhoto;
    }
}
