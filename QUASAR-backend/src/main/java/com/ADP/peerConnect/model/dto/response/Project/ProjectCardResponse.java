package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import com.ADP.peerConnect.model.entity.Project;

public class ProjectCardResponse {

    private String id;
    private String title;
    private String categoryName;
    private Integer maxTeamSize;
    private Integer currentTeamSize;
    private String status;
    private UserCardResponse creator;

    public ProjectCardResponse(Project p) {
        this.id = p.getId();
        this.title = p.getTitle();
        this.status = p.getStatus().name();
        this.maxTeamSize = p.getMaxTeamSize();
        this.currentTeamSize = p.getCurrentTeamSize();
        this.categoryName = p.getCategory() != null ? p.getCategory().getName() : null;
        this.creator=p.getLead()!=null?new UserCardResponse(p.getLead()):null;
    }

    public String getCategoryName() {
        return categoryName;
    }
    public UserCardResponse getCreator() {
        return creator;
    }
    public void setCreator(UserCardResponse creator) {
        this.creator = creator;
    }

    public Integer getCurrentTeamSize() {
        return currentTeamSize;
    }

    public String getId() {
        return id;
    }

    public Integer getMaxTeamSize() {
        return maxTeamSize;
    }

    public String getStatus() {
        return status;
    }

    public String getTitle() {
        return title;
    }
}