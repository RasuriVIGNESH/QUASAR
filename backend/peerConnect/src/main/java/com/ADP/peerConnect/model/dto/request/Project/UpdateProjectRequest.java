package com.ADP.peerConnect.model.dto.request.Project;


import com.ADP.peerConnect.model.enums.ProjectStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class UpdateProjectRequest {
    @Size(min = 5, max = 100)
    private String title;

    @Size(min = 10, max = 1000)
    private String description;

    // legacy 'category' string removed; use categoryId/categoryName instead

    @Min(2)
    @Max(20)
    private Integer maxTeamSize;

    private ProjectStatus status;
    private LocalDate expectedStartDate;
    private LocalDate expectedEndDate;

    @Size(max = 1000)
    private String requirements;

    @Size(max = 1000)
    private String goals;

    @Valid
    private List<ProjectSkillRequest> skills;

    @Size(max = 1000)
    private String problemStatement;

    @Size(max = 1000)
    private String objectives;

    private List<@NotBlank String> techStack;

    @Size(max = 200)
    private String githubRepo;

    @Size(max = 200)
    private String demoUrl;

    // allow updating category via id or name
    private Long categoryId;
    @Size(max = 200)
    private String categoryName;

    // Optional: allow updating the projectFor (by id or name). If both provided, id takes precedence.
    private String projectForId;
    @Size(max = 200)
    private String projectForName;
}
