package com.ADP.peerConnect.model.dto.request.Project;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedCandidateRequest {
    private String userId;
    private Float matchScore;
    private Integer priority;
    private List<String> missingSkills;
}
