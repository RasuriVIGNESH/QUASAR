package com.ADP.peerConnect.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Table(name = "skills", indexes = {
        @Index(name = "idx_skill_name", columnList = "name", unique = true),
        @Index(name = "idx_skill_normalized_name", columnList = "normalized_name", unique = true),
        @Index(name = "idx_skill_category", columnList = "category"),
        @Index(name = "idx_skill_predefined", columnList = "is_predefined"),
        @Index(name = "idx_skill_users_count", columnList = "users_count"),
        @Index(name = "idx_skill_projects_count", columnList = "projects_count")
})
public class Skill {

    @Id
    @Column(name = "id", updatable = false, nullable = false)

    private Long id; // NO @GeneratedValue - we set it manually from hash!

    @Column(name = "name", unique = true, nullable = false, length = 100)
    @NotBlank(message = "Skill name is required")
    @Size(min = 2, max = 100, message = "Skill name must be between 2 and 100 characters")
    private String name;

    /**
     * Normalized version of name (lowercase, trimmed) for case-insensitive matching
     * "Java" -> "java", " Python " -> "python"
     */
    @Column(name = "normalized_name", unique = true, nullable = false, length = 100)
    private String normalizedName;

    @Column(name = "category", length = 50)
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @Column(name = "is_predefined", nullable = false)
    private Boolean isPredefined = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Cached count of how many users have this skill
     * Updated when UserSkill is added/removed
     */
    @Column(name = "users_count", nullable = false)
    private Integer usersCount = 0;

    /**
     * Cached count of how many projects require this skill
     * Updated when ProjectSkill is added/removed
     */
    @Column(name = "projects_count", nullable = false)
    private Integer projectsCount = 0;

    // Relationships
    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<UserSkill> userSkills = new ArrayList<>();

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<ProjectSkill> projectSkills = new ArrayList<>();

    // =============================
    // CONSTRUCTORS
    // =============================

    public Skill(String name, String category, Boolean isPredefined) {
        this.name = name;
        this.normalizedName = normalizeName(name);
        this.id = generateIdFromName(this.normalizedName);
        this.category = category;
        this.isPredefined = isPredefined;
    }
    public Skill(String name) {
        this(name, null, false);
    }
    public static Long generateIdFromName(String normalizedName) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(normalizedName.getBytes(StandardCharsets.UTF_8));
            long result = 0;
            for (int i = 0; i < 8; i++) {
                result = (result << 8) | (hash[i] & 0xFF);
            }
            return Math.abs(result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate skill ID for: " + normalizedName, e);
        }
    }

    public static String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Skill name cannot be null or empty");
        }
        return name.trim().toLowerCase().replaceAll("\\s+", " ");
    }


    public void incrementUsersCount() {
        this.usersCount++;
    }

    /**
     * Decrement user count (call when UserSkill is deleted)
     */
    public void decrementUsersCount() {
        if (this.usersCount > 0) {
            this.usersCount--;
        }
    }

    /**
     * Increment project count (call when ProjectSkill is created)
     */
    public void incrementProjectsCount() {
        this.projectsCount++;
    }

    /**
     * Decrement project count (call when ProjectSkill is deleted)
     */
    public void decrementProjectsCount() {
        if (this.projectsCount > 0) {
            this.projectsCount--;
        }
    }

    /**
     * Check if this skill is popular (used by many users)
     */
    public boolean isPopular() {
        return this.usersCount > 50; // Threshold can be adjusted
    }

    /**
     * Check if this skill is in high demand (required by many projects)
     */
    public boolean isInDemand() {
        return this.projectsCount > 20; // Threshold can be adjusted
    }

    public Integer getUsers() {
        return this.usersCount;
    }
}