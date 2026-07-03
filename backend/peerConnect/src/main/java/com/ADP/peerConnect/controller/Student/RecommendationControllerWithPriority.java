//package com.ADP.peerConnect.controller.Student;
//
//import com.ADP.peerConnect.service.RecommendationService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//
//
//@RestController
//@RequestMapping("/api/recommendations")
//public class RecommendationControllerWithPriority {
//
//    private final RecommendationService recommendationService;
//
//    @Autowired
//    public RecommendationControllerWithPriority(RecommendationService recommendationService) {
//        this.recommendationService = recommendationService;
//    }

//    @GetMapping("/user/{userId}")
//    public ResponseEntity<RecommendationResponseWithPriority> getRecommendations(@PathVariable String userId) {
//        List<UserRecommendedProject> recommendations = recommendationService.getRecommendedProjects(userId);
//        RecommendationResponseWithPriority response = new RecommendationResponseWithPriority(userId, recommendations);
//        return ResponseEntity.ok(response);
//    }
//
//    @GetMapping("/user/{userId}/top")
//    public ResponseEntity<RecommendationResponseWithPriority> getTopRecommendations(
//            @PathVariable String userId) {
//        List<UserRecommendedProject> recommendations = recommendationService.getTopRecommendations(userId);
//        RecommendationResponseWithPriority response = new RecommendationResponseWithPriority(userId, recommendations);
//        return ResponseEntity.ok(response);
//    }
//}