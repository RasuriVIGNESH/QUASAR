package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.Project.CreateMeetingRoom;
import com.ADP.peerConnect.model.dto.request.Project.CreateNote;
import com.ADP.peerConnect.model.dto.request.Project.UpdateNote;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.entity.MeetingRoom;
import com.ADP.peerConnect.model.entity.Note;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.MeetingRoomService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Meeting Room Management", description = "APIs for managing meeting rooms and notes")
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MeetingRoomController {

    @Autowired
    private final MeetingRoomService meetingRoomService;

    @Autowired
    public MeetingRoomController(MeetingRoomService meetingRoomService) {
        this.meetingRoomService = meetingRoomService;
    }

    // ROOM ENDPOINTS

    @PostMapping("/projects/{projectId}/rooms")
    public ResponseEntity<ApiResponse> createMeetingRoom(
            @PathVariable String projectId,
            @Valid @RequestBody CreateMeetingRoom request,
            @Parameter(hidden = true)@AuthenticationPrincipal UserPrincipal currentUser) {
        MeetingRoom room = meetingRoomService.createMeetingRoom(projectId, request, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Meeting room created successfully", room));
    }

    @GetMapping("/projects/{projectId}/rooms")
    public ResponseEntity<ApiResponse> getMeetingRooms(
            @PathVariable String projectId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        List<MeetingRoom> rooms = meetingRoomService.getMeetingRoomsByProjectId(projectId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Meeting rooms retrieved successfully", rooms));
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse> deleteMeetingRoom(
            @PathVariable Long roomId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        meetingRoomService.deleteMeetingRoom(roomId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Meeting room deleted successfully"));
    }

    // NOTE ENDPOINTS

    @PostMapping("/rooms/{roomId}/notes")
    public ResponseEntity<ApiResponse> createNote(
            @PathVariable Long roomId,
            @Valid @RequestBody CreateNote request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        Note note = meetingRoomService.createNote(roomId, request, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Note created successfully", note));
    }

    @GetMapping("/rooms/{roomId}/notes")
    public ResponseEntity<ApiResponse> getNotes(
            @PathVariable Long roomId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        List<Note> notes = meetingRoomService.getNotesByRoomId(roomId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Notes retrieved successfully", notes));
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<ApiResponse> updateNote(
            @PathVariable Long noteId,
            @Valid @RequestBody UpdateNote request,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        Note note = meetingRoomService.updateNote(noteId, request, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Note updated successfully", note));
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<ApiResponse> deleteNote(
            @PathVariable Long noteId,
            @Parameter(hidden = true) @AuthenticationPrincipal UserPrincipal currentUser) {
        meetingRoomService.deleteNote(noteId, currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Note deleted successfully"));
    }
}

