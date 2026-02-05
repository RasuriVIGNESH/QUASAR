//package com.ADP.peerConnect.controller;
//
//import com.ADP.peerConnect.model.entity.Mentor;
//
//import com.ADP.peerConnect.security.UserPrincipal;
//import com.ADP.peerConnect.service.iMentorService;
//import com.ADP.peerConnect.model.dto.response.ApiResponse;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/mentor")
//@PreAuthorize("hasRole('MENTOR')")
//public class MentorController {
//
//    private final iMentorService mentorService;
//
//    public MentorController(iMentorService mentorService) {
//        this.mentorService = mentorService;
//    }
//
//    /**
//     * Get logged-in mentor profile
//     */
//    @GetMapping("/me")
//    public ResponseEntity<ApiResponse<Mentor>> getMyProfile(
//            @AuthenticationPrincipal UserPrincipal principal
//    ) {
//        Mentor mentor = mentorService.getMentorByUserId(principal.getId());
//
//        return ResponseEntity.ok(
//                ApiResponse.success("Mentor profile fetched", mentor)
//        );
//    }
//
//    /**
//     * Update mentor profile
//     */
//    @PutMapping("/me")
//    public ResponseEntity<ApiResponse<Mentor>> updateMyProfile(
//            @AuthenticationPrincipal UserPrincipal principal,
//            @RequestParam(required = false) String department,
//            @RequestParam(required = false) String designation,
//            @RequestParam(required = false) Integer maxMentees
//    ) {
//        Mentor mentor = mentorService.getMentorByUserId(principal.getId());
//
//        Mentor updated = mentorService.updateMentorProfile(
//                mentor,
//                department,
//                designation,
//                maxMentees
//        );
//
//        return ResponseEntity.ok(
//                ApiResponse.success("Mentor profile updated", updated)
//        );
//    }
////    @PostMapping("/project-ideas")
////    public ResponseEntity<ApiResponse<ProjectIdea>> createIdea(
////            @AuthenticationPrincipal UserPrincipal principal,
////            @RequestBody CreateProjectIdeaRequest request
////    ) {
////        ProjectIdea idea = mentorService.createProjectIdea(
////                principal.getId(), request
////        );
////        return ResponseEntity.ok(
////                ApiResponse.success("Project idea created", idea)
////        );
////    }
////    @GetMapping("/project-ideas")
////    public ResponseEntity<ApiResponse<List<ProjectIdea>>> myIdeas(
////            @AuthenticationPrincipal UserPrincipal principal
////    ) {
////        return ResponseEntity.ok(
////                ApiResponse.success(
////                        "Ideas fetched",
////                        mentorService.getIdeasByMentor(principal.getId())
////                )
////        );
////    }
////    @GetMapping("/mentorship-requests")
////    public ResponseEntity<ApiResponse<List<MentorshipRequest>>> requests(
////            @AuthenticationPrincipal UserPrincipal principal
////    ) {
////        return ResponseEntity.ok(
////                ApiResponse.success(
////                        "Requests fetched",
////                        mentorService.getRequests(principal.getId())
////                )
////        );
////    }
////    @PutMapping("/mentorship-requests/{id}/approve")
////    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long id) {
////        mentorService.approveRequest(id);
////        return ResponseEntity.ok(ApiResponse.success("Approved", null));
////    }
////
////    @PutMapping("/mentorship-requests/{id}/reject")
////    public ResponseEntity<ApiResponse<Void>> reject(@PathVariable Long id) {
////        mentorService.rejectRequest(id);
////        return ResponseEntity.ok(ApiResponse.success("Rejected", null));
////    }
////    @GetMapping("/mentees")
////    public ResponseEntity<ApiResponse<List<User>>> mentees(
////            @AuthenticationPrincipal UserPrincipal principal
////    ) {
////        return ResponseEntity.ok(
////                ApiResponse.success(
////                        "Mentees fetched",
////                        mentorService.getMentees(principal.getId())
////                )
////        );
////    }
//
//}
