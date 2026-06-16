package com.ADP.peerConnect.model.dto.request;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class RecommendationRequest {

    @NotNull(message = "User ID is required")
    private String userId;

    @NotEmpty(message = "At least one project ID is required")
    private Set<String> projectIds;
}