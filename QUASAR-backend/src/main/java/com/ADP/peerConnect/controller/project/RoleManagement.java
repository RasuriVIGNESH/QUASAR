package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Arrays;
import java.util.List;


public class RoleManagement {

    @GetMapping("/TeamRoles")
    @Operation(summary = "Get predefined Roles", description = "Get list of Team Roles")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Team Roles retrieved successfully")
    })
    public ResponseEntity<ApiResponse<List<String>>> getRoles() {
        List<String> Roles = Arrays.asList(Constants.TeamRoles);

        ApiResponse<List<String>> response = ApiResponse.success(
                "Roles retrieved successfully", Roles);

        return ResponseEntity.ok(response);
    }
}
