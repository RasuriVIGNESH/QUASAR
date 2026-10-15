package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRecommendationResult {
    private ProjectCardResponse project;
    private int matchScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> reasons;
}
