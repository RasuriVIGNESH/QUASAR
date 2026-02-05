package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.Project.CreateProjectCategoryRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCategoryResponse;
import com.ADP.peerConnect.model.entity.ProjectCategory;
import com.ADP.peerConnect.service.Interface.iProjectCategoryService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "Project Category", description = "Project category APIs")
@RestController
@RequestMapping(Constants.PROJECT_CATEGORY_BASE_PATH)
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectCategoryController {

    @Autowired
    private iProjectCategoryService projectCategoryService;

    @Operation(summary = "List all project categories")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectCategoryResponse>>> listAll() {
        List<ProjectCategory> cats = projectCategoryService.listAll();
        List<ProjectCategoryResponse> responses = cats.stream()
                .map(ProjectCategoryResponse::new)
                .collect(Collectors.toList());
        ApiResponse<List<ProjectCategoryResponse>> resp = ApiResponse.success("Categories retrieved successfully", responses);
        return ResponseEntity.ok(resp);
    }

    @Operation(summary = "Search project categories by name")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProjectCategoryResponse>>> search(@RequestParam(name = "q") String q) {
        List<ProjectCategory> cats = projectCategoryService.searchByName(q);
        List<ProjectCategoryResponse> responses = cats.stream()
                .map(ProjectCategoryResponse::new)
                .collect(Collectors.toList());
        ApiResponse<List<ProjectCategoryResponse>> resp = ApiResponse.success("Categories retrieved successfully", responses);
        return ResponseEntity.ok(resp);
    }

    @Operation(summary = "Get project category by id")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectCategoryResponse>> getById(@PathVariable Long id) {
        return projectCategoryService.findById(id)
                .map(cat -> ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", new ProjectCategoryResponse(cat))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category not found")));
    }

    @Operation(summary = "Create a project category")
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectCategoryResponse>> create(@Valid @RequestBody CreateProjectCategoryRequest request) {
        ProjectCategory category = new ProjectCategory(request.getName());
        ProjectCategory created = projectCategoryService.create(category);
        ApiResponse<ProjectCategoryResponse> resp = ApiResponse.success("Category created successfully", new ProjectCategoryResponse(created));
        return new ResponseEntity<>(resp, HttpStatus.CREATED);
    }
}
