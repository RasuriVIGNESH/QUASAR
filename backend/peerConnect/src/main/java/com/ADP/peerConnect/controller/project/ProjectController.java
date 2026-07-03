package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.dto.request.Project.*;
import com.ADP.peerConnect.model.dto.response.*;
import com.ADP.peerConnect.model.dto.response.Project.*;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.PrivateKey;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Project Management", description = "Project management APIs")
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private TeamService teamService;

    @Autowired
    private ProjectCategoryService projectCategoryService;

    public static final String DEFAULT_SIZE_STR = "20";
    public static final String DEFAULT_PAGE_NUMBER_STR = "0";

    // ===== CORE PROJECT ENDPOINTS =====

    @Operation(summary = "Create project")
    @PostMapping("/Create")
    public ResponseEntity<ApiResponse> createProject(
            @Valid @RequestBody CreateProject request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Project project = projectService.createProject(request, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Project created successfully", new ProjectResponse(project))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @Operation(summary = "Get project by ID")
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable String projectId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        if(!teamService.isProjectMember(projectId,currentUser.getId()))throw new UnauthorizedException("only project members can access");
            Project project = projectService.findById(projectId);
            return new ResponseEntity<>(new ProjectResponse(project),HttpStatus.OK );
    }

    @Operation(summary = "Update project")
    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse> updateProject(
            @PathVariable String projectId,
            @Valid @RequestBody UpdateProject request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Project project = projectService.updateProject(projectId, request, currentUser.getId());
            return ResponseEntity.ok(
                    new ApiResponse(true, "Project updated successfully", new ProjectResponse(project))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @Operation(summary = "Delete project")
    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse> deleteProject(
            @PathVariable String projectId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            projectService.deleteProject(projectId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Project deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }



    // ===== ADDITIONAL DISCOVERY ENDPOINTS =====

    @Operation(summary = "Get my projects")
    @GetMapping("/my-projects")
    public ResponseEntity<PagedResponse<ProjectCardResponse>> getMyProjects(
            @Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER_STR) int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_SIZE_STR) int size,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProjectCardResponse> projects =
                projectService.findProjectsByUser(currentUser.getId(), pageable);

        PagedResponse<ProjectCardResponse> response = new PagedResponse<>(
                projects.getContent(), projects.getNumber(), projects.getSize(),
                projects.getTotalElements(),projects.getTotalPages()
        );
        response.setFirst(projects.isFirst());
        response.setLast(projects.isLast());
        response.setNumberOfElements(projects.getNumberOfElements());
        return ResponseEntity.ok(response);
    }

    // ===== TASK MANAGEMENT ENDPOINTS =====

    @Operation(summary = "Create task")
    @PostMapping("/{projectId}/tasks")
    public ResponseEntity<ApiResponse> createTask(
            @PathVariable String projectId,
            @Valid @RequestBody CreateTask request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Task task = taskService.createTask(projectId, request, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Task created successfully", new TaskResponse(task)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<PagedResponse<TaskResponse>> getProjectTasks(
            @PathVariable String projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Task> tasks = taskService.getProjectTasks(projectId, pageable);

        List<TaskResponse> responses = tasks.getContent()
                .stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());

        PagedResponse<TaskResponse> response = new PagedResponse<>(
                responses, tasks.getNumber(), tasks.getSize(),
                tasks.getTotalElements(), tasks.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update task")
    @PutMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<ApiResponse> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTask request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            TaskResponse taskResponse = new TaskResponse(taskService.updateTask(taskId, request, currentUser.getId()));
            return ResponseEntity.ok(new ApiResponse(true, "Task updated successfully", taskResponse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
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
            return ResponseEntity.ok(new ApiResponse(true, "Task deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }



    @Operation(summary = "List all project categories")
    @GetMapping("/categories")
    public ResponseEntity<List<getCategory>> listAll() {
        List<ProjectCategory> cats = projectCategoryService.listAll();
        List<getCategory>res=cats.stream().map(getCategory::new).collect(Collectors.toList());
        return new ResponseEntity<>(res,HttpStatus.OK);
    }

    @Operation(summary = "Create a project category")
    @PostMapping("/categories")
    public ResponseEntity<String> create(
            @RequestParam @NotBlank(message = "Category name is required") String name) {
        ProjectCategory created = projectCategoryService.create(name);
        return new ResponseEntity<>(created.getName(), HttpStatus.CREATED);
    }
    @Operation(summary = "Search projects",
            description = "use project status only RECRUITING, IN_PROGRESS, COMPLETED, CANCELLED")
    @GetMapping("/searchProjects")
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
        Page<ProjectCardResponse> projects =
                projectService.searchProjects(query, category, status, skills, availableOnly, pageable, currentUserId);

        PagedResponse<ProjectCardResponse> response = new PagedResponse<>(
                projects.getContent(),
                projects.getNumber(),
                projects.getSize(),
                projects.getTotalElements(),
                projects.getTotalPages()
        );
        return ResponseEntity.ok(response);
    }
}