package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import javax.persistence.*;
import javax.validation.constraints.*;

import com.ADP.peerConnect.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ADP.peerConnect.model.entity.College;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_user_email", columnList = "email"),
                @Index(name = "idx_user_college", columnList = "college_id"),
                @Index(name = "idx_user_branch", columnList = "branch"),
                @Index(name = "idx_user_graduation_year", columnList = "graduation_year"),
                @Index(name = "idx_user_availability", columnList = "availability_status"),
                @Index(name = "idx_user_verified", columnList = "is_verified"),
                @Index(name = "idx_user_college_branch", columnList = "college_id, branch"),
                @Index(name = "idx_user_grad_year_status", columnList = "graduation_year, availability_status")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_email", columnNames = {"email"})
        }
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    @Column(name = "email", unique = true, nullable = false, length = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Column(name = "password", nullable = false)
    private String password;

    @Size(min = 2, max = 50)
    @Column(name = "first_name")
    private String firstName;

    @Size(min = 2, max = 50)
    @Column(name = "last_name")
    private String lastName;

    @Size(max = 500)
    @Column(name = "bio", length = 500)
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.STUDENT;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<UserSkill> userSkills = new HashSet<>();

    @Column(name = "is_verified")
    private boolean isVerified;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Lob
    @Column(name = "profile_photo")
    private byte[] profilePhoto;


    @ManyToOne
    @JoinColumn(name = "college_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private College college;


    @Column(name = "branch")
    private String branch;

    @Min(2020)
    @Max(2030)
    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status")
    private AvailabilityStatus availabilityStatus;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "linkedin_id")
    private String linkedinId;

    @Column(name = "github_id")
    private String githubId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_recommended_projects",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "project_id"),
            indexes = {
                    @Index(name = "idx_recommended_user", columnList = "user_id"),
                    @Index(name = "idx_recommended_project", columnList = "project_id")
            }
    )
    private Set<Project> recommendedProjects = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User() {
        this.id = UUID.randomUUID().toString();
    }

    public String getGithubId() {
        return githubId;
    }

    public void setGithubId(String githubId) {
        this.githubId = githubId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public College getCollege() {
        return college;
    }

    public void setCollege(College college) {
        this.college = college;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
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

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
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

    public String getLinkedinId() {
        return linkedinId;
    }

    public void setLinkedinId(String linkedinId) {
        this.linkedinId = linkedinId;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean verified) {
        isVerified = verified;
    }

    public void setIsVerified(boolean verified) {
        this.isVerified = verified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<UserSkill> getUserSkills() {
        return userSkills;
    }

    public void setUserSkills(Set<UserSkill> userSkills) {
        this.userSkills = userSkills;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Set<Project> getRecommendedProjects() {
        return recommendedProjects;
    }

    public void setRecommendedProjects(Set<Project> recommendedProjects) {
        this.recommendedProjects = recommendedProjects;
    }

    public void addRecommendedProject(Project project) {
        this.recommendedProjects.add(project);
    }

    public void removeRecommendedProject(Project project) {
        this.recommendedProjects.remove(project);
    }

    public void addUserSkill(UserSkill userSkill) {
        userSkills.add(userSkill);
        userSkill.setUser(this);
    }

    public void removeUserSkill(UserSkill userSkill) {
        userSkills.remove(userSkill);
        userSkill.setUser(null);
    }
}