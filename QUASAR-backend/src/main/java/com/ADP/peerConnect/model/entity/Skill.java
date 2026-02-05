package com.ADP.peerConnect.model.entity;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.hibernate.annotations.CreationTimestamp;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Skill entity with deterministic ID generation for ML model consistency
 *
 * CRITICAL DESIGN DECISION:
 * - Skill IDs are generated from skill name hash (MD5)
 * - This ensures the SAME skill name always gets the SAME ID
 * - Required for ML recommendation system to match skills accurately
 * - Example: User's "Java" (ID: 5234987623498765) matches Project's "Java" (same ID)
 *
 * @author PeerConnect Team
 * @version 2.0 - ML Optimized
 */
@Entity
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
    private Long id;  // NO @GeneratedValue - we set it manually from hash!

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
    @JsonManagedReference("user-skill")
    private List<UserSkill> userSkills = new ArrayList<>();

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonBackReference("project-skill")
    private List<ProjectSkill> projectSkills = new ArrayList<>();

    // =============================
    //        CONSTRUCTORS
    // =============================

    public Skill() {
    }

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

    // =============================
    //    DETERMINISTIC ID GENERATION
    // =============================

    /**
     * Generate deterministic ID from skill name using MD5 hash
     *
     * Why MD5?
     * - Fast computation
     * - Deterministic (same input always produces same output)
     * - Wide distribution (minimal collisions)
     *
     * Algorithm:
     * 1. Take normalized skill name (lowercase, trimmed)
     * 2. Compute MD5 hash
     * 3. Convert first 8 bytes to Long
     * 4. Ensure positive number
     *
     * Examples:
     * - "java" -> 5234987623498765
     * - "python" -> 8765432109876543
     * - "react" -> 1234567890123456
     *
     * @param normalizedName Lowercase, trimmed skill name
     * @return Deterministic Long ID
     */
    public static Long generateIdFromName(String normalizedName) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(normalizedName.getBytes(StandardCharsets.UTF_8));

            // Convert first 8 bytes to Long
            long result = 0;
            for (int i = 0; i < 8; i++) {
                result = (result << 8) | (hash[i] & 0xFF);
            }

            // Ensure positive (avoid negative IDs)
            return Math.abs(result);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate skill ID for: " + normalizedName, e);
        }
    }

    /**
     * Normalize skill name for consistent comparison and ID generation
     *
     * Rules:
     * - Convert to lowercase
     * - Trim whitespace
     * - Remove extra spaces
     *
     * Examples:
     * - "Java" -> "java"
     * - " Python " -> "python"
     * - "REACT  JS" -> "react js"
     *
     * @param name Original skill name
     * @return Normalized skill name
     */
    public static String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Skill name cannot be null or empty");
        }
        return name.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    // =============================
    //        GETTERS / SETTERS
    // =============================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.normalizedName = normalizeName(name);
        this.id = generateIdFromName(this.normalizedName);
    }

    public String getNormalizedName() {
        return normalizedName;
    }

    public void setNormalizedName(String normalizedName) {
        this.normalizedName = normalizedName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getIsPredefined() {
        return isPredefined;
    }

    public void setIsPredefined(Boolean isPredefined) {
        this.isPredefined = isPredefined;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getUsersCount() {
        return usersCount;
    }

    public void setUsersCount(Integer usersCount) {
        this.usersCount = usersCount;
    }

    public Integer getProjectsCount() {
        return projectsCount;
    }

    public void setProjectsCount(Integer projectsCount) {
        this.projectsCount = projectsCount;
    }

    public List<UserSkill> getUserSkills() {
        return userSkills;
    }

    public void setUserSkills(List<UserSkill> userSkills) {
        this.userSkills = userSkills;
    }

    public List<ProjectSkill> getProjectSkills() {
        return projectSkills;
    }

    public void setProjectSkills(List<ProjectSkill> projectSkills) {
        this.projectSkills = projectSkills;
    }

    // =============================
    //        UTILITY METHODS
    // =============================

    /**
     * Increment user count (call when UserSkill is created)
     */
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
        return this.usersCount > 50;  // Threshold can be adjusted
    }

    /**
     * Check if this skill is in high demand (required by many projects)
     */
    public boolean isInDemand() {
        return this.projectsCount > 20;  // Threshold can be adjusted
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Skill)) return false;
        Skill skill = (Skill) o;
        return id != null && id.equals(skill.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Skill{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", normalizedName='" + normalizedName + '\'' +
                ", category='" + category + '\'' +
                ", isPredefined=" + isPredefined +
                ", usersCount=" + usersCount +
                ", projectsCount=" + projectsCount +
                '}';
    }

    public Integer getUsers() {
        return this.usersCount;
    }
}