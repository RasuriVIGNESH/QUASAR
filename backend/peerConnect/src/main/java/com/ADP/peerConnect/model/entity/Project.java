package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.ProjectStatus;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
@Table(name = "projects", indexes = {
        @Index(name = "idx_project_lead", columnList = "lead_id"),
        @Index(name = "idx_project_status", columnList = "status"),
        @Index(name = "idx_project_category", columnList = "category_id"),
        @Index(name = "idx_project_created", columnList = "created_at"),
        @Index(name = "idx_project_event", columnList = "event_id"),
        @Index(name = "idx_project_status_created", columnList = "status, created_at")
})
public class Project {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "title", nullable = false, length = 100)
    @NotBlank(message = "Project title is required")
    @Size(min = 5, max = 100, message = "Project title must be between 5 and 100 characters")
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Project description is required")
    @Size(min = 10, max = 1000, message = "Project description must be between 10 and 1000 characters")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "category_id", nullable = false)
    @NotNull(message = "Project category is required")
    private ProjectCategory category;

    @Column(name = "max_team_size", nullable = false)
    @NotNull(message = "Maximum team size is required")
    @Min(value = 1, message = "Team size must be at least 2")
    @Max(value = 20, message = "Team size must not exceed 20")
    private Integer maxTeamSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProjectStatus status = ProjectStatus.RECRUITING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    @NotNull(message = "Project Lead is required")
    private User lead;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "expected_start_date")
    private LocalDate expectedStartDate;

    @Column(name = "expected_end_date")
    private LocalDate expectedEndDate;

    @Column(name = "problem_statement", columnDefinition = "TEXT")
    private String problemStatement;

    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private String techStack;

    @Column(name = "github_repo")
    private String githubRepo;

    @Column(name = "demo_url")
    private String demoUrl;

    @Column(name = "notepad_content", columnDefinition = "TEXT")
    private String notepadContent;

    @Column(name = "goals", columnDefinition = "TEXT")
    private String goals;

    @Column(name = "objectives", columnDefinition = "TEXT")
    private String objectives;

    @Column(name = "current_team_size", nullable = false)
    private Integer currentTeamSize = 0;

    @Column(name = "open_tasks_count", nullable = false)
    private Integer openTasksCount = 0;

    @Column(name = "completed_tasks_count", nullable = false)
    private Integer completedTasksCount = 0;

    @BatchSize(size = 25)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectSkill> projectSkills = new ArrayList<>();

    @BatchSize(size = 25)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectMember> projectMembers = new ArrayList<>();

    @BatchSize(size = 25)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectInvitation> projectInvitations = new ArrayList<>();

    @BatchSize(size = 25)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Task> tasks = new ArrayList<>();

    @BatchSize(size = 25)
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectJoinRequest> projectJoinRequests = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MeetingRoom> meetingRooms = new ArrayList<>();


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    public boolean isFull() {
        return getCurrentTeamSize() >= maxTeamSize;
    }

    public boolean canAcceptNewMembers() {
        return status.canAcceptMembers() && !isFull();
    }

    public boolean isLead(String userId) {
        return lead != null && lead.getId().equals(userId);
    }

    public boolean isMember(String userId) {
        if (isLead(userId)) return true;
        return projectMembers.stream()
                .anyMatch(member -> member.getUser().getId().equals(userId));
    }

    public boolean canDelete() {
        return status != ProjectStatus.IN_PROGRESS && status != ProjectStatus.COMPLETED;
    }

    public boolean isActive() {
        return status.isActive();
    }

    public boolean isCompleted() {
        return status == ProjectStatus.COMPLETED;
    }

    public List<String> getTechStackList() {
        if (techStack == null || techStack.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return List.of(techStack.split(","));
    }

    public void setTechStackFromList(List<String> techStackList) {
        if (techStackList != null && !techStackList.isEmpty()) {
            this.techStack = String.join(",", techStackList);
        } else {
            this.techStack = null;
        }
    }
    @PrePersist
    private void ensureId() {
        // Safety net: guarantees id is set before INSERT no matter which constructor
        // or code path created this entity (e.g. new Project() + setters), since
        // id has no @GeneratedValue and Hibernate will reject persist() with a null id.
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }

    public Project(String title, String description, String category, Integer maxTeamSize, User lead) {
        this();
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.description = description;
        this.category = null;
        this.maxTeamSize = maxTeamSize;
        this.lead = lead;
    }
}