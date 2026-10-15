package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectSkill;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProjectDiscoverableDetailResponse {
    private String id;
    private String title;
    private String description;
    private String problemStatement;
    private String goals;
    private String objectives;
    private String githubRepo;
    private String demoUrl;
    private String status;
    private String categoryName;
    private LocalDate expectedStartDate;
    private LocalDate expectedEndDate;
    private Integer currentTeamSize;
    private Integer maxTeamSize;
    private ProjectCardResponse projectCard;
    private List<RequestedSkill> requestedSkills;

    public ProjectDiscoverableDetailResponse(Project project, List<ProjectSkill> projectSkills) {
        this.id = project.getId();
        this.title = project.getTitle();
        this.description = project.getDescription();
        this.problemStatement = project.getProblemStatement();
        this.goals = project.getGoals();
        this.objectives = project.getObjectives();
        this.githubRepo = project.getGithubRepo();
        this.demoUrl = project.getDemoUrl();
        this.status = project.getStatus() == null ? null : project.getStatus().name();
        this.categoryName = project.getCategory() == null ? null : project.getCategory().getName();
        this.expectedStartDate = project.getExpectedStartDate();
        this.expectedEndDate = project.getExpectedEndDate();
        this.currentTeamSize = project.getCurrentTeamSize();
        this.maxTeamSize = project.getMaxTeamSize();
        this.projectCard = new ProjectCardResponse(project, projectSkills);
        this.requestedSkills = projectSkills.stream()
                .map(skill -> new RequestedSkill(skill.getSkill().getId(), skill.getSkill().getName(), skill.getRequiredLevel()))
                .toList();
    }

    @Data
    public static class RequestedSkill {
        private final Long skillId;
        private final String name;
        private final com.ADP.peerConnect.model.enums.SkillLevel requiredLevel;
    }
}
