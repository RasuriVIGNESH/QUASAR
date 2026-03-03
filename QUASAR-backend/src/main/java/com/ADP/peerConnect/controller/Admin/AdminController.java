package com.ADP.peerConnect.controller.Admin;

import com.ADP.peerConnect.model.dto.request.Admin.CreateMentorRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.dto.response.MentorResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.Mentor;
import com.ADP.peerConnect.repository.MentorRepository;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.service.Interface.iAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private iAdminService adminService;


    @GetMapping("/mentors")
    public ResponseEntity<ApiResponse<List<MentorResponse>>> listMentors() {
        List<MentorResponse> mentors = adminService.getAllMentors();
        return ResponseEntity.ok(ApiResponse.success("Mentors fetched", mentors));
    }
    @PostMapping("/create-mentor")
    public ResponseEntity<?> createMentor(@RequestBody CreateMentorRequest request){
        return ResponseEntity.ok(adminService.createMentor(request));
    }

}
