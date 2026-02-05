package com.ADP.peerConnect.model.dto.response.Project;

import com.ADP.peerConnect.model.dto.response.SkillResponse;
import com.ADP.peerConnect.model.entity.ProjectSkill;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Project skill response DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectSkillResponse {
    
//    private String id;
    private SkillResponse skill;
//    private SkillLevel requiredLevel;
    private Boolean isRequired;
    
    public ProjectSkillResponse() {}
    public ProjectSkillResponse(ProjectSkill projectSkill) {
//        this.id = projectSkill.getId();
//        this.requiredLevel = projectSkill.getRequiredLevel();
        this.isRequired = projectSkill.getIsRequired();

        // Check if the associated skill is not null before creating the response
        if (projectSkill.getSkill() != null) {
            this.skill = new SkillResponse(projectSkill.getSkill());
        }
    }
    
    // Getters and Setters
//    public String getId() {
//        return id;
//    }
//
//    public void setId(String id) {
//        this.id = id;
//    }
    
    public SkillResponse getSkill() {
        return skill;
    }
    
    public void setSkill(SkillResponse skill) {
        this.skill = skill;
    }
    
//    public SkillLevel getRequiredLevel() {
//        return requiredLevel;
//    }
//
//    public void setRequiredLevel(SkillLevel requiredLevel) {
//        this.requiredLevel = requiredLevel;
//    }
    
    public Boolean getIsRequired() {
        return isRequired;
    }
    
    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }
}

