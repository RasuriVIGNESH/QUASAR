package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.entity.Skill;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Skill response DTO
 */

@NoArgsConstructor
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SkillResponse {

    private String name;
    private String category;

    public SkillResponse(Skill skill) {
        this.name = skill.getName();
        this.category = skill.getCategory();
    }

}
