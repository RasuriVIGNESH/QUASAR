package com.ADP.peerConnect.controller.Admin;

import com.ADP.peerConnect.model.dto.request.CreateCollegeRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.entity.College;
import com.ADP.peerConnect.service.Impl.CollegeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/colleges")
@Tag(name = "College Management", description = "APIs for managing and retrieving college information")
public class CollegeController {

    @Autowired
    private CollegeService collegeService;

    /**
     * Get college by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a single college by its ID", description = "Fetches details for a specific college by its ID. This is a public endpoint.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "College details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "College not found")
    })
    public ResponseEntity<ApiResponse<College>> getCollegeById(@PathVariable Long id) {
        College college = collegeService.getCollegeById(id);
        ApiResponse<College> response = ApiResponse.success(
                "College retrieved successfully", college);
        return ResponseEntity.ok(response);
    }

}
