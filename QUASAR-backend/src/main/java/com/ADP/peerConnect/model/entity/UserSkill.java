package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.SkillLevel;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonBackReference;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_skills", indexes = {
        @Index(name = "idx_user_skill_user", columnList = "user_id"),
        @Index(name = "idx_user_skill_skill", columnList = "skill_id"),
        @Index(name = "idx_user_skill_level", columnList = "level")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_skill", columnNames = {"user_id", "skill_id"})
})
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    @JsonBackReference
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    @NotNull(message = "Skill is required")
    @JsonBackReference("user-skill")
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    @NotNull(message = "Skill level is required")
    private SkillLevel level;

    @Column(name = "experience", columnDefinition = "TEXT")
    @Size(max = 500, message = "Experience description must not exceed 500 characters")
    private String experience;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public UserSkill() {
    }

    public UserSkill(User user, Skill skill, SkillLevel level) {
        this.user = user;
        this.skill = skill;
        this.level = level;
    }

    public UserSkill(User user, Skill skill, SkillLevel level, String experience) {
        this(user, skill, level);
        this.experience = experience;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserSkill)) return false;
        UserSkill userSkill = (UserSkill) o;
        return id != null && id.equals(userSkill.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "UserSkill{" +
                "id=" + id +
                ", level=" + level +
                ", experience='" + experience + '\'' +
                '}';
    }
}