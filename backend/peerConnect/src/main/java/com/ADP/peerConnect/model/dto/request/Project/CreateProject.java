package com.ADP.peerConnect.model.dto.request.Project;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateProject {
    @NotBlank
    @Size(min = 5, max = 100)
    private String title;

    @NotBlank
    @Size(min = 10, max = 1000)
    private String description;

    private Long categoryId;
    @Size(max = 200)
    private String categoryName;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer maxTeamSize;

    private LocalDate expectedStartDate;
    private LocalDate expectedEndDate;

    @Size(max = 1000)
    private String goals;

    @Size(max = 1000)
    private String problemStatement;

    @Size(max = 1000)
    private String objectives;

    @NotEmpty(message = "At least one skill is required")
    @Valid
    private List<ProjectSkill> skills;

    private List<@NotBlank String> techStack;

    @Size(max = 200)
    private String githubRepo;

    @Size(max = 200)
    private String demoUrl;

    private String projectForId;
    @Size(max = 200)
    private String projectForName;
    private Long eventId;

}
