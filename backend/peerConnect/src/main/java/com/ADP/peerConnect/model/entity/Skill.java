package com.ADP.peerConnect.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
        @Index(name = "idx_skill_category", columnList = "category")
})
public class Skill {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    @NotBlank(message = "Skill name is required")
    @Size(min = 2, max = 100, message = "Skill name must be between 2 and 100 characters")
    private String name;

    @Column(name = "normalized_name", unique = true, nullable = false, length = 100)
    private String normalizedName;

    @Column(name = "category", length = 50)
    @Size(max = 50, message = "Category must not exceed 50 characters")
    private String category;

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<UserSkill> userSkills = new ArrayList<>();

    @OneToMany(mappedBy = "skill", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<ProjectSkill> projectSkills = new ArrayList<>();

    private int users;


    public Skill(String name, String category) {
        this.name = name;
        this.normalizedName = normalizeName(name);
        this.category = category;
    }

    public Skill(String name) {
        this.name=name;
    }

    public static String normalizeName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Skill name cannot be null or empty");
        }
        return name.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    public void setUsersCount(int i) {
        this.users=i;
    }

    public int getUsersCount() {return users;}
}