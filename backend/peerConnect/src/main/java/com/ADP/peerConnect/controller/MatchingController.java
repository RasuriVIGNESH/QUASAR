package com.ADP.peerConnect.controller;
import com.ADP.peerConnect.model.dto.response.*;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequiredArgsConstructor @RequestMapping("/api/matching")
public class MatchingController {
    private final MentorMatchingService mentorService; private final EventMatchingService eventService;
    @GetMapping("/mentors") public ResponseEntity<List<MentorMatchResponse>> mentors(@RequestParam(defaultValue="20") int limit,@AuthenticationPrincipal UserPrincipal principal){return ResponseEntity.ok(mentorService.findMatches(principal.getId(),limit));}
    @GetMapping("/events") public ResponseEntity<List<EventMatchResponse>> events(@RequestParam(defaultValue="20") int limit,@AuthenticationPrincipal UserPrincipal principal){return ResponseEntity.ok(eventService.findMatches(principal.getId(),limit));}
}
