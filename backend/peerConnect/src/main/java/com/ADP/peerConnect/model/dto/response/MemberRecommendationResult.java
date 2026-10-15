package com.ADP.peerConnect.model.dto.response;

import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberRecommendationResult {
    private UserCardResponse student;
    private int matchScore;
    private AvailabilityStatus availabilityStatus;
    private int activeProjectCount;
    private List<String> skillsToFill;
    private List<String> reasons;
}
