package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.stream.Collectors;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String bio;
    private CollegeResponse college;
    private String branch;
    private Integer graduationYear;
    private AvailabilityStatus availabilityStatus;
    private String profilePictureUrl;
    private byte[] profilePhoto;
    private List<UserSkillResponse> skills;

    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;


    public UserResponse() {
    }

    public UserResponse(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.availabilityStatus = user.getAvailabilityStatus();
        this.bio = user.getBio();
        this.branch = user.getBranch();
        this.githubUrl = user.getGithubUrl();
        this.graduationYear = user.getGraduationYear();
        this.linkedinUrl = user.getLinkedinUrl();
        this.portfolioUrl = user.getPortfolioUrl();
        this.profilePictureUrl = user.getProfilePictureUrl();
        this.profilePhoto = user.getProfilePhoto();
        this.skills = user.getUserSkills() == null ? null : user.getUserSkills().stream()
                .map(UserSkillResponse::new)
                .collect(Collectors.toList());
        this.college = user.getCollege() != null ? new CollegeResponse(user.getCollege()) : null;
    }

    public UserResponse(String id, String email, String firstName, String lastName) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }


    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
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

    public List<UserSkillResponse> getSkills() {
        return skills;
    }

    public void setSkills(List<UserSkillResponse> skills) {
        this.skills = skills;
    }
    public CollegeResponse getCollege() {
        return college;
    }
    public void setCollege(CollegeResponse college) {
        this.college = college;
    }
}
