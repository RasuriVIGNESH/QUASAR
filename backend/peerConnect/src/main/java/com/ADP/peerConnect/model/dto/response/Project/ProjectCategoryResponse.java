package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.entity.ProjectCategory;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectCategoryResponse {

    private String name;

    public ProjectCategoryResponse(ProjectCategory category) {
        if (category != null) {
            this.name = category.getName();
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}

