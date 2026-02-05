package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.Skill;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Skill response DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillResponse {

    private String name;
    private String category;
    private Boolean isPredefined;

    private Integer users;

    public SkillResponse() {}
    public SkillResponse(Skill skill) {
        this.name = skill.getName();
        this.category = skill.getCategory();
        this.isPredefined = skill.getIsPredefined();

        this.users = skill.getUsers();
    }
    
    // Getters and Setters

    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public Boolean getIsPredefined() {
        return isPredefined;
    }
    
    public void setIsPredefined(Boolean isPredefined) {
        this.isPredefined = isPredefined;
    }

    public Integer getUsers() {
        return users;
    }

    public void setUsers(Integer users) {
        this.users = users;
    }
}
