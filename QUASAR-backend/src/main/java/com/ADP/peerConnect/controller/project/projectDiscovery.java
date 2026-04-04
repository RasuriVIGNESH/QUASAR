package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;


@RestController("projectDiscovery")
public class projectDiscovery {

    @Autowired
    private iProjectService projectService;
    public static final String DEFAULT_SIZE_STR = "20";
    public static final String DEFAULT_PAGE_NUMBER_STR = "0";

    @Operation(summary = "Discover projects")
    @GetMapping("/api/discover")
    public ResponseEntity<PagedResponse<ProjectCardResponse>> discoverProjects(
            @Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER_STR) int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_SIZE_STR) int size,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser){

        Pageable pageable = PageRequest.of(page, size);
        Page<Project> projectPage = projectService.discoverProjects(currentUser.getId(), pageable);

        // Convert the Page<Project> to a List<ProjectResponse>
        List<ProjectCardResponse> projectResponses = projectPage.getContent().stream()
                .map(ProjectCardResponse::new) // Uses the constructor we fixed
                .collect(Collectors.toList());

        // Create the final PagedResponse object
        PagedResponse<ProjectCardResponse> response = new PagedResponse<>(
                projectResponses,
                projectPage.getNumber(),
                projectPage.getSize(),
                projectPage.getTotalElements(),
                projectPage.getTotalPages()
        );
        // This is a good practice to set all fields of your paged response
        response.setFirst(projectPage.isFirst());
        response.setLast(projectPage.isLast());
        response.setNumberOfElements(projectPage.getNumberOfElements());

        return ResponseEntity.ok(response);

    }

    @Operation(summary = "Get projects in College", description = "Get a paginated list of projects associated with a specific college ID.")
    @GetMapping("/by-college/{collegeId}")
    public ResponseEntity<PagedResponse<ProjectCardResponse>> getProjectsInCollege(
            @PathVariable String collegeId,
            @Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER_STR) int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_SIZE_STR) int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Project> projects = projectService.findProjetsInCollege(collegeId, pageable);

        List<ProjectCardResponse> projectResponses = projects.getContent().stream()
                .map(ProjectCardResponse::new)
                .collect(Collectors.toList());

        PagedResponse<ProjectCardResponse> response = new PagedResponse<>(
                projectResponses,
                projects.getNumber(),
                projects.getSize(),
                projects.getTotalElements(),
                projects.getTotalPages()
        );
        response.setFirst(projects.isFirst());
        response.setLast(projects.isLast());
        response.setNumberOfElements(projects.getNumberOfElements());

        return ResponseEntity.ok(response);
    }


    @Operation(summary = "Search projects", description = "use project status only RECRUITING, IN_PROGRESS, COMPLETED, CANCELLED")
    @GetMapping("/api/searchProjects")
    public ResponseEntity<PagedResponse<ProjectCardResponse>> searchProjects(
            @Parameter(description = "Search query") @RequestParam(required = false) String query,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Status filter") @RequestParam(required = false) ProjectStatus status,
            @Parameter(description = "Skills filter") @RequestParam(required = false) List<String> skills,
            @Parameter(description = "Available only") @RequestParam(defaultValue = "false") boolean availableOnly,
            @Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER_STR) int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_SIZE_STR) int size,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        String currentUserId = currentUser != null ? currentUser.getId() : null;
        Page<Project> projects = projectService.searchProjects(query, category, status, skills, availableOnly, pageable, currentUserId);
        List<ProjectCardResponse> content = projects.getContent()
                .stream()
                .map(ProjectCardResponse::new)
                .collect(Collectors.toList());

        PagedResponse<ProjectCardResponse> response = new PagedResponse<>(
                content,
                projects.getNumber(),
                projects.getSize(),
                projects.getTotalElements(),
                projects.getTotalPages()
        );
        return ResponseEntity.ok(response);
    }






}
