package com.ADP.peerConnect.controller.Student;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.DashboardCountsResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iProjectService;
import com.ADP.peerConnect.service.Interface.iUserService;
import com.ADP.peerConnect.service.Interface.iUserSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Dashboard related APIs")
public class DashboardController {

    @Autowired
    private iProjectService projectService;

    @Autowired
    private iUserSkillService userSkillService;
    @Autowired
    private iUserService userService;

    @Operation(summary = "Get dashboard counts")
    @GetMapping("/counts")
    public ResponseEntity<ApiResponse<DashboardCountsResponse>> getDashboardCounts(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        long projectsCount = projectService.countProjectsForUser(currentUser.getId());
        long skillsCount = userSkillService.getUserSkillCount(currentUser.getId());

        DashboardCountsResponse dto = new DashboardCountsResponse(projectsCount, skillsCount);
        ApiResponse<DashboardCountsResponse> response = ApiResponse.success("Dashboard counts retrieved", dto);
        return ResponseEntity.ok(response);
    }
}

