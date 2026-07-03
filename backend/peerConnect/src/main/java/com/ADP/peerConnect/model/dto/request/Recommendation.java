package com.ADP.peerConnect.model.dto.request;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Set;

@Data
public class Recommendation {

    @NotNull(message = "User ID is required")
    private String userId;

    @NotEmpty(message = "At least one project ID is required")
    private Set<String> projectIds;
}