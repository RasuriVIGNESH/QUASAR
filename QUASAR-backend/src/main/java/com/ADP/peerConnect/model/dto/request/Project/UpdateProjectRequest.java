package com.ADP.peerConnect.model.dto.request.Project;

import javax.validation.Valid;

import com.ADP.peerConnect.model.enums.ProjectStatus;
import javax.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public class UpdateProjectRequest {
    @Size(min = 5, max = 100)
    private String title;

    @Size(min = 10, max = 1000)
    private String description;

    // legacy 'category' string removed; use categoryId/categoryName instead

    @Min(2)
    @Max(20)
    private Integer maxTeamSize;

    private ProjectStatus status;
    private LocalDate expectedStartDate;
    private LocalDate expectedEndDate;

    @Size(max = 1000)
    private String requirements;

    @Size(max = 1000)
    private String goals;

    @Valid
    private List<ProjectSkillRequest> skills;

    @Size(max = 1000)
    private String problemStatement;

    @Size(max = 1000)
    private String objectives;

    private List<@NotBlank String> techStack;

    @Size(max = 200)
    private String githubRepo;

    @Size(max = 200)
    private String demoUrl;

    // allow updating category via id or name
    private Long categoryId;
    @Size(max = 200)
    private String categoryName;

    // Optional: allow updating the projectFor (by id or name). If both provided, id takes precedence.
    private String projectForId;
    @Size(max = 200)
    private String projectForName;

    public UpdateProjectRequest() {}

    // Getters & Setters

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public List<ProjectSkillRequest> getSkills() { return skills; }
    public void setSkills(List<ProjectSkillRequest> skills) { this.skills = skills; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Integer getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(Integer maxTeamSize) { this.maxTeamSize = maxTeamSize; }

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }

    public LocalDate getExpectedStartDate() { return expectedStartDate; }
    public void setExpectedStartDate(LocalDate expectedStartDate) { this.expectedStartDate = expectedStartDate; }

    public LocalDate getExpectedEndDate() { return expectedEndDate; }
    public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }

    public String getRequirements() { return requirements; }
    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getObjectives() { return objectives; }
    public void setObjectives(String objectives) { this.objectives = objectives; }

    public List<String> getTechStack() { return techStack; }
    public void setTechStack(List<String> techStack) { this.techStack = techStack; }

    public String getGithubRepo() { return githubRepo; }
    public void setGithubRepo(String githubRepo) { this.githubRepo = githubRepo; }

    public String getDemoUrl() { return demoUrl; }
    public void setDemoUrl(String demoUrl) { this.demoUrl = demoUrl; }

    public String getProjectForId() { return projectForId; }
    public void setProjectForId(String projectForId) { this.projectForId = projectForId; }

    public String getProjectForName() { return projectForName; }
    public void setProjectForName(String projectForName) { this.projectForName = projectForName; }
}
