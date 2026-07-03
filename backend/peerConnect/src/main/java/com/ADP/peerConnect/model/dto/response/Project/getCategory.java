package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.entity.ProjectCategory;
import lombok.Data;

@Data
public class getCategory {
    private Long id;
    private String name;

    public getCategory(ProjectCategory entity){
        this.id=entity.getId();
        this.name=entity.getName();
    }
}
