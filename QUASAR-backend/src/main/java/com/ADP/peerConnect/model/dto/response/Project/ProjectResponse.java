package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Project response DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectResponse {
    
    private String id;
    private String title;
    private String description;
    //private String category;
    private ProjectStatus status;
    private LocalDate expectedStartDate;
    private LocalDate expectedEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private Integer maxTeamSize;
    private Integer currentTeamSize;
    private String requirements;
    private String goals;
    private String problemStatement;
    private List<String> techStack;
    private String githubRepo;
    private String demoUrl;
    private String notepadContent;
    private String objectives;
    private UserResponse Lead;
    private List<ProjectSkillResponse> requiredSkills;
    private List<ProjectMemberResponse> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // projectFor (purpose) information
    // category info
    private String categoryName;

    public ProjectResponse() {}
    public ProjectResponse(Project project) {
        this.id = project.getId();
        this.title = project.getTitle();
        this.description = project.getDescription();
        if (project.getCategory() != null) {
            this.categoryName = project.getCategory().getName();
        }
        this.status = project.getStatus();
        this.expectedStartDate = project.getExpectedStartDate();
        this.expectedEndDate = project.getExpectedEndDate();
        this.maxTeamSize = project.getMaxTeamSize();
        this.currentTeamSize = project.getCurrentTeamSize();
        this.requirements = null; // legacy field - not used currently
        this.goals = project.getGoals();
        this.problemStatement = project.getProblemStatement();
        this.createdAt = project.getCreatedAt();
        this.updatedAt = project.getUpdatedAt();
        this.githubRepo = project.getGithubRepo();
        this.demoUrl = project.getDemoUrl();
        this.notepadContent = project.getNotepadContent();
        this.objectives = project.getObjectives();

        // map tech stack to a list for frontend consumption
        if (project.getTechStack() != null) {
            this.techStack = project.getTechStackList();
        }

        if (project.getLead() != null) {
            this.Lead = new UserResponse(project.getLead());
        }

        if (project.getProjectSkills() != null && !project.getProjectSkills().isEmpty()) {
            this.requiredSkills = project.getProjectSkills().stream()
                    .map(ProjectSkillResponse::new)
                    .collect(Collectors.toList());
        }

        if (project.getProjectMembers() != null && !project.getProjectMembers().isEmpty()) {
            this.members = project.getProjectMembers().stream()
                    .map(pm -> new ProjectMemberResponse(pm.getId(), pm.getJoinedAt(), pm.getProjectRole(), new UserResponse(pm.getUser())))
                    .collect(Collectors.toList());
        }
    }




    //     Getters and Setters
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

    public ProjectStatus getStatus() {
        return status;
    }
    
    public void setStatus(ProjectStatus status) {
        this.status = status;
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
    
    public LocalDate getActualStartDate() {
        return actualStartDate;
    }
    
    public void setActualStartDate(LocalDate actualStartDate) {
        this.actualStartDate = actualStartDate;
    }
    
    public LocalDate getActualEndDate() {
        return actualEndDate;
    }
    
    public void setActualEndDate(LocalDate actualEndDate) {
        this.actualEndDate = actualEndDate;
    }
    
    public Integer getMaxTeamSize() {
        return maxTeamSize;
    }
    
    public void setMaxTeamSize(Integer maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }
    
    public Integer getCurrentTeamSize() {
        return currentTeamSize;
    }
    
    public void setCurrentTeamSize(Integer currentTeamSize) {
        this.currentTeamSize = currentTeamSize;
    }
    
    public String getRequirements() {
        return requirements;
    }
    
    public void setRequirements(String requirements) {
        this.requirements = requirements;
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

    public List<String> getTechStack() {
        return techStack;
    }

    public void setTechStack(List<String> techStack) {
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

    public String getObjectives() {
        return objectives;
    }

    public void setObjectives(String objectives) {
        this.objectives = objectives;
    }

    public UserResponse getLead() {
        return Lead;
    }
    
    public void setLead(UserResponse Lead) {
        this.Lead = Lead;
    }
    
    public List<ProjectSkillResponse> getRequiredSkills() {
        return requiredSkills;
    }
    
    public void setRequiredSkills(List<ProjectSkillResponse> requiredSkills) {
        this.requiredSkills = requiredSkills;
    }
    
    public List<ProjectMemberResponse> getMembers() {
        return members;
    }
    
    public void setMembers(List<ProjectMemberResponse> members) {
        this.members = members;
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

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
