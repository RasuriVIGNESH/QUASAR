package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.SkillLevel;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * User skill response DTO
 */

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserSkillResponse {
    
    private Long id;
    private SkillResponse skill;
    private SkillLevel level;
    private String experience;


    public UserSkillResponse(UserSkill userSkill) {
        if (userSkill == null) return;
        this.id = userSkill.getId();
        if (userSkill.getSkill() != null) {
            this.skill = new SkillResponse(userSkill.getSkill());
        }
        this.level = userSkill.getLevel();
        this.experience = userSkill.getExperience();
    }
}
