package com.ADP.peerConnect.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "project_roles",
        indexes = @Index(name = "idx_project_roles_project", columnList = "project_id"),
        uniqueConstraints = @UniqueConstraint(name = "uk_project_role_normalized_name",
                columnNames = {"project_id", "normalized_name"}))
public class ProjectRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonBackReference("project-roles")
    private Project project;

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    @Column(name = "normalized_name", nullable = false, length = 100)
    private String normalizedName;

    @Column(name = "filled", nullable = false)
    private boolean filled;

    public ProjectRole(Project project, String name, String normalizedName) {
        this.project = project;
        this.name = name;
        this.normalizedName = normalizedName;
        this.filled = false;
    }
}
