package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.repository.SkillDemandProjection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillDemandResponse {
    private Long skillId;
    private String skillName;
    private String category;
    private long activeProjectCount;
    private long recruitingProjectCount;
    private long inProgressProjectCount;

    public SkillDemandResponse(SkillDemandProjection projection) {
        this.skillId = projection.getSkillId();
        this.skillName = projection.getSkillName();
        this.category = projection.getCategory();
        this.activeProjectCount = safe(projection.getActiveProjectCount());
        this.recruitingProjectCount = safe(projection.getRecruitingProjectCount());
        this.inProgressProjectCount = safe(projection.getInProgressProjectCount());
    }

    private long safe(Long value) {
        return value == null ? 0L : value;
    }
}
