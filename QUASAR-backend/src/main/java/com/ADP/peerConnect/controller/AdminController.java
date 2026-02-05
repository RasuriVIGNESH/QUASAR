package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.request.Admin.CreateMentorRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.entity.Mentor;
import com.ADP.peerConnect.service.Interface.iAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private iAdminService adminService;

    @PostMapping("/mentors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMentor(@RequestBody CreateMentorRequest request) {
        // Generate a random password for mentor and send via email in real implementation
        String password = java.util.UUID.randomUUID().toString().substring(0, 8);
        Mentor mentor = adminService.createMentor(request.getEmail(), request.getFirstName(), request.getLastName(), password);

        Map<String, Object> data = new HashMap<>();
        data.put("mentor", mentor);
        data.put("password", password); // Return to admin so they can share credentials securely

        return ResponseEntity.ok(ApiResponse.success("Mentor created", data));
    }

    @GetMapping("/mentors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Mentor>>> listMentors() {
        List<Mentor> mentors = adminService.getAllMentors();
        return ResponseEntity.ok(ApiResponse.success("Mentors fetched", mentors));
    }
}
