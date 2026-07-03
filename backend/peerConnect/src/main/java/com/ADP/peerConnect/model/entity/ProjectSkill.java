package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.SkillLevel;
import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ProjectSkill entity representing the relationship between Project and Skill
 * FIXED: Removed duplicate 'required' field, kept only 'isRequired'
 */
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Table(name = "project_skills", indexes = {
        @Index(name = "idx_project_skill_project", columnList = "project_id"),
        @Index(name = "idx_project_skill_skill", columnList = "skill_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_project_skill", columnNames = { "project_id", "skill_id" })
})
public class ProjectSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @NotNull(message = "Project is required")
    @JsonBackReference
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    @NotNull(message = "Skill is required")
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_level")
    private SkillLevel requiredLevel;




    public ProjectSkill(Project project, Skill skill,SkillLevel level) {
        this.project = project;
        this.skill = skill;
        this.requiredLevel=level;
    }
}