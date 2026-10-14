package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectSkill;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Data
public class ProjectCardResponse {

    private String id;
    private String title;
    private String categoryName;
    private Integer maxTeamSize;
    private Integer currentTeamSize;
    private List<String> skillsRequired;
    private String status;
    private UserCardResponse Lead;
    private List<String> memberProfileImageUrls;

    public ProjectCardResponse(Project project) {
        this.id = project.getId();
        this.title = project.getTitle();

        this.status = project.getStatus() != null
                ? project.getStatus().name()
                : null;

        this.maxTeamSize = project.getMaxTeamSize();
        this.currentTeamSize = project.getCurrentTeamSize();

        this.categoryName = project.getCategory() != null
                ? project.getCategory().getName()
                : null;

        this.Lead = project.getTeam() != null
                && project.getTeam().getLead() != null
                ? new UserCardResponse(project.getTeam().getLead())
                : null;

        this.skillsRequired = project.getProjectSkills() == null
                ? new ArrayList<>()
                : project.getProjectSkills()
                .stream()
                .filter(Objects::nonNull)
                .map(ProjectSkill::getSkill)
                .filter(Objects::nonNull)
                .map(skill -> skill.getName())
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        this.memberProfileImageUrls = new ArrayList<>();
    }
}
