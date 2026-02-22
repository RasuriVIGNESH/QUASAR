package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.CollegeResponse;
import com.ADP.peerConnect.model.dto.response.PagedResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.dto.response.SkillResponse;
import com.ADP.peerConnect.model.entity.College;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.service.Impl.CollegeService;
import com.ADP.peerConnect.service.Impl.UserService;
import com.ADP.peerConnect.service.Interface.iProjectService;
import com.ADP.peerConnect.service.Interface.iSkillService;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@RestController("/api/public")
public class publicEndpoints {

    @Autowired
    private iProjectService projectService;

    @Autowired
    private CollegeService collegeService;

    @Autowired
    private iSkillService skillService;

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private UserService userService;

    @Operation(summary = "Get recent projects")
    @GetMapping("/api/RecentProjects")
    public ResponseEntity<PagedResponse<ProjectResponse>> getAllProjects()


//            @Parameter(description = "Page number") @RequestParam(defaultValue = DEFAULT_PAGE_NUMBER_STR) int page,
//            @Parameter(description = "Page size") @RequestParam(defaultValue = DEFAULT_SIZE_STR) int size,
//            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
//            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir
{

        Sort.Direction direction =  Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(0, 10, Sort.by(direction, "createdAt"));


    Page<Project> projects = projectService.findAll(pageable);

    List<ProjectResponse> content = projects.getContent()
            .stream()
            .map(ProjectResponse::new)
            .collect(Collectors.toList());
    PagedResponse<ProjectResponse> response =
            new PagedResponse<>(
                    content,
                    projects.getNumber(),
                    projects.getSize(),
                    projects.getTotalElements(),
                    projects.getTotalPages()
            );

    return ResponseEntity.ok(response);


}
    @GetMapping("/api/colleges")
    @Transactional(readOnly = true)
    @Operation(summary = "Get all registered colleges", description = "Fetches a list of all available colleges. This is a public endpoint.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of colleges retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<CollegeResponse>>> getAllColleges() {

        // 1. Fetch the raw entities from the database
        List<College> colleges = collegeService.getAllColleges();

        // 2. Map the entities to safe DTOs to prevent Jackson from triggering lazy loading errors
        List<CollegeResponse> collegeResponses = colleges.stream()
                .map(CollegeResponse::new)
                .collect(Collectors.toList());

        // 3. Return the DTOs
        ApiResponse<List<CollegeResponse>> response = ApiResponse.success(
                "Colleges retrieved successfully", collegeResponses);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/popularSkills")
    @Operation(summary = "Get popular skills", description = "Get most popular skills based on usage")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Popular skills retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PagedResponse<SkillResponse>>> getPopularSkills()
//            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
//            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size)
    {

        Pageable pageable = PageRequest.of(0, 10);
        Page<Skill> skills = skillService.getPopularSkills(pageable);

        List<SkillResponse> skillResponses = skills.getContent().stream()
                .map(skill -> modelMapper.map(skill, SkillResponse.class))
                .collect(Collectors.toList());

        PagedResponse<SkillResponse> pagedResponse = new PagedResponse<>(
                skillResponses, skills.getNumber(), skills.getSize(),
                skills.getTotalElements(), skills.getTotalPages());

        ApiResponse<PagedResponse<SkillResponse>> response = ApiResponse.success(
                "Popular skills retrieved successfully", pagedResponse);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/api/branches")
    @Operation(summary = "Get branches", description = "Get list of available academic branches")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Branches retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<String>>> getBranches() {
        List<String> branches = java.util.Arrays.asList(Constants.BRANCHES);

        ApiResponse<List<String>> response = ApiResponse.success(
                "Branches retrieved successfully", branches);

        return ResponseEntity.ok(response);
    }

    /**
     * Get graduation year options
     */
    @GetMapping("/api/graduation-years")
    @Operation(summary = "Get graduation years", description = "Get list of available graduation years")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Graduation years retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<Integer>>> getGraduationYears() {
        List<Integer> years = IntStream.rangeClosed(Constants.MIN_GRADUATION_YEAR, Constants.MAX_GRADUATION_YEAR)
                .boxed()
                .collect(Collectors.toList());

        ApiResponse<List<Integer>> response = ApiResponse.success(
                "Graduation years retrieved successfully", years);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/count")
    @Operation(summary = "Get user count", description = "Get total number of registered users")
    public List<Integer> LandingPageCount() {
        int projects=projectService.countAllProjects();
        int users=userService.getUserCount();
        return List.of(users,projects);


    }


    @GetMapping("/api/predefined-skills")
    @Operation(summary = "Get predefined skills", description = "Get list of predefined skills")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Predefined skills retrieved successfully")
    })
    public ResponseEntity< ApiResponse<List<SkillResponse>>> getPredefinedSkills() {
        // Build list of SkillResponse from the PREDEFINED_SKILLS_MAP (preserves order)
        List<SkillResponse> skills = new ArrayList<>();
        for (Map.Entry<String, String> entry : Constants.PREDEFINED_SKILLS_MAP.entrySet()) {
            SkillResponse sr = new SkillResponse();
            sr.setName(entry.getKey());
            sr.setCategory(entry.getValue());
            sr.setIsPredefined(Boolean.TRUE);
            skills.add(sr);
        }

        ApiResponse<List<SkillResponse>> response = ApiResponse.success(
                "Predefined skills retrieved successfully", skills);

        return ResponseEntity.ok(response);
    }

}
