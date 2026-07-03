package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.dto.response.EventsResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }


//    @PostMapping("/register")
//    public ResponseEntity<Project> registerForEvent(@RequestBody CreateProjectRequest project,
//                                              @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
//        Project reg = eventService.register(currentUser.getId(), project);
//        return ResponseEntity.ok(reg);
//    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventsResponse> getEventById(@PathVariable Long eventId) {
        Event event = eventService.getEvent(eventId);
        EventsResponse response = new EventsResponse(event);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingEvents() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/{eventId}/students")
    public ResponseEntity<List<UserResponse>> getEventUsers(@PathVariable Long eventId) {
        List<User> users = eventService.getEventUsers(eventId);

        List<UserResponse> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }
    @GetMapping("/{eventId}/students/count")
    @Operation(summary = "Get exact registration count", description = "Get total number of registrations for an event")
    public ResponseEntity<Long> getEventUserCount(@PathVariable Long eventId) {
        Long count = eventService.getUserCount(eventId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{eventId}/students/{userId}/exists")
    @Operation(summary = "Check event registration", description = "Check if user is registered for an event")
    public ResponseEntity<Boolean> checkUserInEvent(
            @PathVariable Long eventId,
            @PathVariable String userId) {
        boolean exists = eventService.existsUserInEvent(eventId, userId);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/all")
    public ResponseEntity<List<EventsResponse>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        List<EventsResponse> responses = events.stream().map(EventsResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }


    @GetMapping("/recent")
    public ResponseEntity<List<EventsResponse>> getRecentEvents(
            @RequestParam(required = false, defaultValue = "10") int limit) {
        List<Event> events = eventService.getRecentEvents(limit);
        List<EventsResponse> responses = events.stream().map(EventsResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{eventId}/projects")
    public ResponseEntity<List<ProjectCardResponse>> getEventProjects(
            @PathVariable Long eventId) {
        List<ProjectCardResponse> projects = eventService.getProjects(eventId);
        return ResponseEntity.ok(projects);
    }

    private UserResponse convertToDTO(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }


    /**
     * Admin creates a new event
//     */
//    @PostMapping("")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<EventsResponse> createEvent(@RequestBody Event event) {
//        Event created = eventService.createEvent(event);
//        return ResponseEntity.ok(new EventsResponse(created));
//    }

    /**
     * Admin updates an event
     */
//    @PutMapping("/{eventId}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<EventsResponse> updateEvent(@PathVariable Long eventId, @RequestBody Event event) {
//        event.setId(eventId);
//        Event updated = eventService.updateEvent(event);
//        return ResponseEntity.ok(new EventsResponse(updated));
//    }

    /**
     * Admin deletes an event
     */
//    @DeleteMapping("/{eventId}")
//    @PreAuthorize("hasRole('ADMIN')")
//    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {
//        eventService.deleteEvent(eventId);
//        return ResponseEntity.ok().build();
//    }


}