package com.ADP.peerConnect.controller;

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
import java.util.List;

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

    /**
     * Create a new college (Admin only)
     */
    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')") // Secures this endpoint for Admins
    @Operation(summary = "Create a new college (Admin only)", description = "Adds a new college to the database. Requires ADMIN role.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "College created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden (not an admin)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "College with this name or code already exists")
    })
    public ResponseEntity<ApiResponse<College>> createCollege(@Valid @RequestBody CreateCollegeRequest request) {
        College newCollege = collegeService.createCollege(
                request.getName(),
                request.getLocation()
        );
        ApiResponse<College> response = ApiResponse.success(
                "College created successfully", newCollege);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Delete a college (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Secures this endpoint for Admins
    @Operation(summary = "Delete a college (Admin only)", description = "Deletes a college by its ID. Requires ADMIN role.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "College deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden (not an admin)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "College not found")
    })
    public ResponseEntity<ApiResponse<String>> deleteCollege(@PathVariable Long id) {
        collegeService.deleteCollege(id);
        ApiResponse<String> response = ApiResponse.success(
                "College deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get college by name")
    public ResponseEntity<ApiResponse<College>> getCollegeByName(@PathVariable String name) {
        ApiResponse<College> response = ApiResponse.success(
                "College retrieved successfully", collegeService.getCollegeByName(name));
        return ResponseEntity.ok(response);
    }
}
