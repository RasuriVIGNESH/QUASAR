package com.ADP.peerConnect.model.dto;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class ProjectRecommendationDTO {

    @NotBlank(message = "Project ID is required")
    private String projectId;  // Changed from Long to String

    @NotNull(message = "Priority is required")
    @Min(value = 1, message = "Priority must be between 1 and 100")
    @Max(value = 100, message = "Priority must be between 1 and 100")
    private Integer priority = 50; // Default priority
}