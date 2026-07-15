package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.Project.AllTeam;
import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import java.util.List;



@RestController
@RequestMapping("/api")
@Tag(name = "Team Management", description = "Team and invitation management APIs")
public class TeamController {

        @Autowired
        private TeamService teamService;

        @GetMapping("/projects/{projectId}/members")
        @Operation(summary = "Get project members", description = "Get all members of a project")
        public ResponseEntity<ApiResponse<AllTeam>>getProjectMembers(
                        @Parameter(description = "Project ID") @PathVariable String projectId,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
                AllTeam team = teamService.getAllTeam(projectId,
                                currentUser.getId());
                ApiResponse<AllTeam> response = ApiResponse.success(
                                "Members retrieved successfully", team);

                return ResponseEntity.ok(response);
        }

        @DeleteMapping("/projects/{projectId}/members/{memberId}")
        @Operation(summary = "Remove project member", description = "Remove member from project (Lead only)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Member removed successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project Lead can remove members"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Member not found"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Cannot remove project Lead")
        })
        public ResponseEntity<ApiResponse<Void>> removeMemberFromProject(
                        @Parameter(description = "Project ID") @PathVariable String projectId,
                        @Parameter(description = "Member user ID") @PathVariable String memberId,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
                teamService.removeMemberFromTeam(projectId, memberId, currentUser.getId());
                ApiResponse<Void> response = ApiResponse.success("Member removed successfully");

                return ResponseEntity.ok(response);
        }

        @PutMapping("/projects/{projectId}/members/{memberId}")
        @Operation(summary = "Update project lead", description = "make member as lead (Lead only)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Member updated successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only project Lead can update members"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Member not found")
        })
        public ResponseEntity<AllTeam> updateMemberInProject(
                        @Parameter(description = "Project ID") @PathVariable String projectId,
                        @Parameter(description = "Member user ID") @PathVariable String memberId,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
                AllTeam team = teamService.updateLead(projectId, memberId, currentUser.getId());
                return new ResponseEntity<>(team,HttpStatus.OK);
        }

        @PostMapping("/projects/{projectId}/leave")
        @Operation(summary = "Leave project", description = "Leave a project (non-Lead only)")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Left project successfully"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Not a member of this project"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Project Lead cannot leave")
        })
        public ResponseEntity<ApiResponse<Void>> leaveProject(
                        @Parameter(description = "Project ID") @PathVariable String projectId,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {

                teamService.leaveProject(projectId, currentUser.getId());
                ApiResponse<Void> response = ApiResponse.success("Left project successfully");
                return ResponseEntity.ok(response);
        }
}