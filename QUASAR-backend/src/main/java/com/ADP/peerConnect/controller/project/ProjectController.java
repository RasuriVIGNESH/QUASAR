package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.Project.*;
import com.ADP.peerConnect.model.dto.response.*;
import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.dto.response.Project.TaskResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iProjectInvitationService;
import com.ADP.peerConnect.service.Interface.iProjectService;
import com.ADP.peerConnect.service.Interface.iTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Project Management", description = "Project management APIs")
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectController {

    @Autowired
    private iProjectService projectService;

    @Autowired
    private iProjectInvitationService projectInvitationService;

    @Autowired
    private iTaskService taskService;

    @Autowired
    private com.ADP.peerConnect.service.Impl.ProjectRecommendationService projectRecommendationService;


    public static final String DEFAULT_SIZE_STR = "20";
    public static final String DEFAULT_PAGE_NUMBER_STR = "0";

    // ===== CORE PROJECT ENDPOINTS =====

    @Operation(summary = "Create project")
    @PostMapping
    public ResponseEntity<ApiResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Project project = projectService.createProject(request, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Project created successfully", project)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Get project by ID")
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse> getProject(
            @PathVariable String projectId,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Project project = projectService.findById(projectId);
            ProjectResponse response = new ProjectResponse(project);

            return ResponseEntity.ok(
                    new ApiResponse(true, "Project retrieved successfully", response)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Update project")
    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse> updateProject(
            @PathVariable String projectId,
            @Valid @RequestBody UpdateProjectRequest request,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Project project = projectService.updateProject(projectId, request, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Project updated successfully", project)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Delete project")
    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse> deleteProject(
            @PathVariable String projectId,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            projectService.deleteProject(projectId, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Project deleted successfully")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Add project member", description = "Add a user to a project. (Project Lead only)")
    @PostMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse> addMember(
            @PathVariable String projectId,
            @Valid @RequestBody AddMemberRequest request,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            // Service method handles 'isLead' authorization
            ProjectMember member = projectService.addMember(
                    projectId,
                    request.getUserId(),
                    request.getRole(),
                    currentUser.getId()
            );
            return ResponseEntity.ok(
                    new ApiResponse(true, "Member added successfully", member)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }
    // ===== ADDITIONAL DISCOVERY ENDPOINTS =====

    @Operation(summary = "Get my projects")
    @GetMapping("/my-projects")
    public ResponseEntity<PagedResponse<ProjectResponse>> getMyProjects(
            // Make sure these two parameters are in your method signature
            @Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER_STR) int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_SIZE_STR) int size,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);

        // Call the new service method that gets both owned and joined projects
        Page<Project> projects = projectService.findProjectsByUser(currentUser.getId(), pageable);

        List<ProjectResponse> projectResponses = projects.getContent().stream()
                .map(ProjectResponse::new)
                .collect(Collectors.toList());

        PagedResponse<ProjectResponse> response = new PagedResponse<>(
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


    // ===== PROJECT INVITATION ENDPOINTS =====

    @Operation(summary = "Send project invitation")
    @PostMapping("/{projectId}/invitations")
    public ResponseEntity<ApiResponse> sendInvitation(
            @PathVariable String projectId,
            @Valid @RequestBody SendInvitationRequest request,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            ProjectInvitation invitation = projectInvitationService.sendInvitation(
                    projectId, request.getInvitedUserId(), request.getMessage(),
                    request.getRole(), currentUser.getId()
            );
            return ResponseEntity.ok(
                    new ApiResponse(true, "Invitation sent successfully", invitation)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    // ===== TASK MANAGEMENT ENDPOINTS =====

    @Operation(summary = "Create task")
    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<ApiResponse> createTask(
            @PathVariable String projectId,
            @Valid @RequestBody CreateTaskRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Task task = taskService.createTask(projectId, request, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Task created successfully", task)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Get project tasks")
    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<TaskResponse>> getProjectTasks(
            @PathVariable String projectId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            List<Task> tasks = taskService.getProjectTasks(projectId);
            return ResponseEntity.ok(tasks.stream()
                    .map(task -> new TaskResponse(task))
                    .collect(Collectors.toList()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Operation(summary = "Update task")
    @PutMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse> updateTask(
            @PathVariable String projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Task task = taskService.updateTask(taskId, request, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Task updated successfully", task)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Delete task")
    @DeleteMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse> deleteTask(
            @PathVariable String projectId,
            @PathVariable Long taskId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            taskService.deleteTask(taskId, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Task deleted successfully")
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Toggle task completion")
    @PutMapping("/{projectId}/tasks/{taskId}/complete")
    public ResponseEntity<ApiResponse> toggleTaskCompletion(
            @PathVariable String projectId,
            @PathVariable Long taskId,
            @RequestBody ToggleTaskRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Task task = taskService.toggleTaskCompletion(taskId, request.isCompleted(), currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Task completion updated", task)
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse(false, e.getMessage())
            );
        }
    }

    @Operation(summary = "Add recommended candidate to project (admin only)")
    @PostMapping("/{projectId}/recommendations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> addRecommendation(
            @PathVariable String projectId,
            @Valid @RequestBody List<com.ADP.peerConnect.model.dto.request.Project.RecommendedCandidateRequest> requests
    ) {
        try {
            List<com.ADP.peerConnect.model.entity.ProjectRecommendedCandidate> added = requests.stream()
                    .map(r -> projectRecommendationService.addRecommendation(projectId, r.getUserId(), r.getMatchScore(), r.getPriority(), r.getMissingSkills() == null ? null : r.getMissingSkills().toArray(new String[0])))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse(true, "Recommendations added", added));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @Operation(summary = "Get recommended candidates for a project")
    @GetMapping("/{projectId}/recommendations")
    public ResponseEntity<ApiResponse> getRecommendations(@PathVariable String projectId) {
        List<com.ADP.peerConnect.model.entity.ProjectRecommendedCandidate> list = projectRecommendationService.getRecommendationsForProject(projectId);
        return ResponseEntity.ok(new ApiResponse(true, "Recommendations fetched", list));
    }







}