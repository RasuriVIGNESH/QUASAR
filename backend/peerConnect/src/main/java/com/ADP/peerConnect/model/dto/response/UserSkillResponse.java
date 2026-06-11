package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.SkillLevel;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * User skill response DTO
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSkillResponse {
    
    private Long id;
    private SkillResponse skill;
    private SkillLevel level;
    private String experience;
    private LocalDateTime createdAt;
    
    public UserSkillResponse() {}

    // New constructor to map from entity
    public UserSkillResponse(UserSkill userSkill) {
        if (userSkill == null) return;
        this.id = userSkill.getId();
        if (userSkill.getSkill() != null) {
            this.skill = new SkillResponse(userSkill.getSkill());
        }
        this.level = userSkill.getLevel();
        this.experience = userSkill.getExperience();
        this.createdAt = userSkill.getCreatedAt();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SkillResponse getSkill() {
        return skill;
    }
    
    public void setSkill(SkillResponse skill) {
        this.skill = skill;
    }
    
    public SkillLevel getLevel() {
        return level;
    }
    
    public void setLevel(SkillLevel level) {
        this.level = level;
    }
    
    public String getExperience() {
        return experience;
    }
    
    public void setExperience(String experience) {
        this.experience = experience;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
