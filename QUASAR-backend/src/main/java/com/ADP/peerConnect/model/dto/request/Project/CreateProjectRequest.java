package com.ADP.peerConnect.model.dto.request.Project;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;

import javax.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public class CreateProjectRequest {
    @NotBlank
    @Size(min = 5, max = 100)
    private String title;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String description;

    // Category: frontend should provide either an existing category id or a new category name.
    // At least one of categoryId or categoryName must be provided by the client.
    private Long categoryId;
    @Size(max = 200)
    private String categoryName;

    @NotNull
    @Min(2)
    @Max(20)
    private Integer maxTeamSize;

    private LocalDate expectedStartDate;
    private LocalDate expectedEndDate;

//    @Size(max = 1000)
//    private String requirements;

    @Size(max = 1000)
    private String goals;

    @Size(max = 1000)
    private String problemStatement;

    @Size(max = 1000)
    private String objectives;

    @NotEmpty(message = "At least one skill is required")
    @Valid
    private List<ProjectSkillRequest> skills;

    private List<@NotBlank String> techStack;

    @Size(max = 200)
    private String githubRepo;

    @Size(max = 200)
    private String demoUrl;

    // Optional: either provide an existing ProjectFor id, or provide a new name to create one.
    // Both are optional; if both provided, id takes precedence.
    private String projectForId;
    @Size(max = 200)
    private String projectForName;


    public CreateProjectRequest() {}

    // Getters & Setters

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Integer getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(Integer maxTeamSize) { this.maxTeamSize = maxTeamSize; }

    public LocalDate getExpectedStartDate() { return expectedStartDate; }
    public void setExpectedStartDate(LocalDate expectedStartDate) { this.expectedStartDate = expectedStartDate; }

    public LocalDate getExpectedEndDate() { return expectedEndDate; }
    public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }

//    public String getRequirements() { return requirements; }
//    public void setRequirements(String requirements) { this.requirements = requirements; }

    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getObjectives() { return objectives; }
    public void setObjectives(String objectives) { this.objectives = objectives; }

    public List<ProjectSkillRequest> getSkills() { return skills; }
    public void setSkills(List<ProjectSkillRequest> skills) { this.skills = skills; }

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
