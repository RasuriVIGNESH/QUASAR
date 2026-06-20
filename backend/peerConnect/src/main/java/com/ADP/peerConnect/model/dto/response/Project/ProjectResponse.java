package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Project response DTO
 */

@NoArgsConstructor
@AllArgsConstructor
@Setter @Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectResponse {
    
    private String id;
    private String title;
    private String description;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String categoryName;


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
        if (project.getTechStack() != null) {
            this.techStack = project.getTechStackList();
        }

        if (project.getLead() != null) {
            this.Lead = new UserResponse(project.getLead());
        }
    }
}
