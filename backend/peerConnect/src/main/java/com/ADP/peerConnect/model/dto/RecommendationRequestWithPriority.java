package com.ADP.peerConnect.model.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class RecommendationRequestWithPriority {

    @NotNull(message = "User ID is required")
    private String userId;

    @NotEmpty(message = "At least one project recommendation is required")
    @Valid
    private List<ProjectRecommendationDTO> recommendations;

}