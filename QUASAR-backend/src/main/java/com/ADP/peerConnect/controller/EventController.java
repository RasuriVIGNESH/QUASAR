package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.dto.response.EventResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.EventRegistration;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Impl.EventRegistrationService;
import com.ADP.peerConnect.service.Impl.EventService;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRegistrationService registrationService;

    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long eventId) {
        Event event = eventService.getEvent(eventId);
        EventResponse response = new EventResponse(event);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents() {
        List<Event> events = eventService.getUpcomingEvents();
        List<EventResponse> responses = events.stream().map(EventResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * Student registers for an event
     */
    @PostMapping("/{eventId}/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> registerForEvent(@PathVariable Long eventId,
                                              @Parameter(hidden = true)
                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        EventRegistration reg = registrationService.register(eventId, currentUser.getId());
        return ResponseEntity.ok(new EventResponse(reg.getEvent()));
    }

    /**
     * Admin creates a new event
     */
    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> createEvent(@RequestBody Event event) {
        Event created = eventService.createEvent(event);
        return ResponseEntity.ok(new EventResponse(created));
    }

    /**
     * Admin updates an event
     */
    @PutMapping("/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long eventId, @RequestBody Event event) {
        event.setId(eventId);
        Event updated = eventService.updateEvent(event);
        return ResponseEntity.ok(new EventResponse(updated));
    }

    /**
     * Admin deletes an event
     */
    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{eventId}/users")
    public ResponseEntity<List<UserResponse>> getEventUsers(@PathVariable Long eventId) {
        List<User> users = eventService.getEventUsers(eventId);

        List<UserResponse> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/{eventId}/users/count")
    public ResponseEntity<Long> getEventUserCount(@PathVariable Long eventId) {
        Long count = eventService.getUserCount(eventId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{eventId}/users/{userId}/exists")
    public ResponseEntity<Boolean> checkUserInEvent(
            @PathVariable Long eventId,
            @PathVariable String userId) {
        boolean exists = eventService.existsUserInEvent(eventId, userId);
        return ResponseEntity.ok(exists);
    }

    /**
     * Get all events (regardless of status)
     */
    @GetMapping("/all")
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        List<EventResponse> responses = events.stream().map(EventResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    /**
     * Get recent events (default 10). Optional query param `limit` can override.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<EventResponse>> getRecentEvents(@RequestParam(required = false, defaultValue = "10") int limit) {
        List<Event> events = eventService.getRecentEvents(limit);
        List<EventResponse> responses = events.stream().map(EventResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private UserResponse convertToDTO(User user) {
        // Use ModelMapper or manual mapping
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }
}