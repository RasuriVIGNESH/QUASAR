package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import com.ADP.peerConnect.model.entity.Project;
import lombok.Data;

import java.util.List;

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

    public ProjectCardResponse(Project p) {
        this.id = p.getId();
        this.title = p.getTitle();
        this.status = p.getStatus().name();
        this.maxTeamSize = p.getMaxTeamSize();
        this.currentTeamSize = p.getCurrentTeamSize();
        this.categoryName = p.getCategory() != null ? p.getCategory().getName() : null;
        this.Lead=new UserCardResponse(p.getTeam().getLead());
        this.skillsRequired = p.getProjectSkills() != null
                ? p.getProjectSkills().stream()
                .map(ps -> ps.getSkill().getName())
                .collect(java.util.stream.Collectors.toList())
                : new java.util.ArrayList<>();
    }
}