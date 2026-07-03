package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import jakarta.persistence.*;
import com.ADP.peerConnect.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.UuidGenerator;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter @Getter
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


    // personal info
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    @UuidGenerator
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

    @BatchSize(size = 25)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<UserSkill> userSkills = new HashSet<>();

    @Column(name = "is_verified")
    private boolean isVerified;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

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

    @Column(name = "github_id")
    private String githubId;


    @BatchSize(size = 25)
    @ManyToMany(mappedBy = "members", fetch = FetchType.LAZY)
    private Set<Team> teams = new HashSet<>();


    @BatchSize(size = 25)
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

}