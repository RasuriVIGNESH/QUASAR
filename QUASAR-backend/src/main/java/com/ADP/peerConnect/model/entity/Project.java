package com.ADP.peerConnect.model.entity;

import com.ADP.peerConnect.model.enums.ProjectStatus;
import javax.persistence.*;
import javax.validation.constraints.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
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
    @Min(value = 2, message = "Team size must be at least 2")
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

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectSkill> projectSkills = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectMember> projectMembers = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectInvitation> projectInvitations = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProjectJoinRequest> projectJoinRequests = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<MeetingRoom> meetingRooms = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "event_id")
    private Event event;

    public Project() {
        this.id = UUID.randomUUID().toString();
    }

    public Project(String title, String description, String category, Integer maxTeamSize, User lead) {
        this();
        this.title = title;
        this.description = description;
        this.category = null;
        this.maxTeamSize = maxTeamSize;
        this.lead = lead;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProjectCategory getCategory() {
        return category;
    }

    public void setCategory(ProjectCategory category) {
        this.category = category;
    }

    public Integer getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(Integer maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public User getLead() {
        return lead;
    }

    public void setLead(User lead) {
        this.lead = lead;
    }

    public User getLeader() {
        return lead;
    }

    public void setLeader(User leader) {
        this.lead = leader;
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

    public LocalDate getExpectedStartDate() {
        return expectedStartDate;
    }

    public void setExpectedStartDate(LocalDate expectedStartDate) {
        this.expectedStartDate = expectedStartDate;
    }

    public LocalDate getExpectedEndDate() {
        return expectedEndDate;
    }

    public void setExpectedEndDate(LocalDate expectedEndDate) {
        this.expectedEndDate = expectedEndDate;
    }

    public String getGoals() {
        return goals;
    }

    public void setGoals(String goals) {
        this.goals = goals;
    }

    public String getProblemStatement() {
        return problemStatement;
    }

    public void setProblemStatement(String problemStatement) {
        this.problemStatement = problemStatement;
    }

    public String getObjectives() {
        return objectives;
    }

    public void setObjectives(String objectives) {
        this.objectives = objectives;
    }

    public String getTechStack() {
        return techStack;
    }

    public void setTechStack(String techStack) {
        this.techStack = techStack;
    }

    public String getGithubRepo() {
        return githubRepo;
    }

    public void setGithubRepo(String githubRepo) {
        this.githubRepo = githubRepo;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public String getNotepadContent() {
        return notepadContent;
    }

    public void setNotepadContent(String notepadContent) {
        this.notepadContent = notepadContent;
    }

    public Integer getCurrentTeamSize() {
        return currentTeamSize;
    }

    public void setCurrentTeamSize(Integer currentTeamSize) {
        this.currentTeamSize = currentTeamSize;
    }

    public Integer getOpenTasksCount() {
        return openTasksCount;
    }

    public void setOpenTasksCount(Integer openTasksCount) {
        this.openTasksCount = openTasksCount;
    }

    public Integer getCompletedTasksCount() {
        return completedTasksCount;
    }

    public void setCompletedTasksCount(Integer completedTasksCount) {
        this.completedTasksCount = completedTasksCount;
    }

    public List<ProjectSkill> getProjectSkills() {
        return projectSkills;
    }

    public void setProjectSkills(List<ProjectSkill> projectSkills) {
        this.projectSkills = projectSkills;
    }

    public List<ProjectMember> getProjectMembers() {
        return projectMembers;
    }

    public void setProjectMembers(List<ProjectMember> projectMembers) {
        this.projectMembers = projectMembers;
    }

    public List<ProjectInvitation> getProjectInvitations() {
        return projectInvitations;
    }

    public void setProjectInvitations(List<ProjectInvitation> projectInvitations) {
        this.projectInvitations = projectInvitations;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public List<MeetingRoom> getMeetingRooms() {
        return meetingRooms;
    }

    public void setMeetingRooms(List<MeetingRoom> meetingRooms) {
        this.meetingRooms = meetingRooms;
    }

    public List<ProjectJoinRequest> getProjectJoinRequests() {
        return projectJoinRequests;
    }

    public void setProjectJoinRequests(List<ProjectJoinRequest> projectJoinRequests) {
        this.projectJoinRequests = projectJoinRequests;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Project)) return false;
        Project project = (Project) o;
        return id != null && id.equals(project.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Project{" +
                "id='" + id + '\'' +
                ", title='" + title + '\'' +
                ", category='" + (category != null ? category.getName() : null) + '\'' +
                ", maxTeamSize=" + maxTeamSize +
                ", currentTeamSize=" + currentTeamSize +
                ", status=" + status +
                '}';
    }
}