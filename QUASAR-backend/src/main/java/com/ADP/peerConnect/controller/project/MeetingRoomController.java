package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.model.dto.request.Project.CreateMeetingRoomRequest;
import com.ADP.peerConnect.model.dto.request.Project.CreateNoteRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateNoteRequest;
import com.ADP.peerConnect.model.dto.response.ApiResponse;
import com.ADP.peerConnect.model.entity.MeetingRoom;
import com.ADP.peerConnect.model.entity.Note;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Impl.MeetingRoomService;
import com.ADP.peerConnect.service.Interface.iMeetingRoomService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Tag(name = "Meeting Room Management", description = "APIs for managing meeting rooms and notes")
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MeetingRoomController {

    @Autowired
    private final iMeetingRoomService meetingRoomService;

    @Autowired
    public MeetingRoomController(MeetingRoomService meetingRoomService) {
        this.meetingRoomService = meetingRoomService;
    }

    // ROOM ENDPOINTS

    @PostMapping("/projects/{projectId}/rooms")
    public ResponseEntity<ApiResponse> createMeetingRoom(
            @PathVariable String projectId,
            @Valid @RequestBody CreateMeetingRoomRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            MeetingRoom room = meetingRoomService.createMeetingRoom(projectId, request, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Meeting room created successfully", room));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/projects/{projectId}/rooms")
    public ResponseEntity<ApiResponse> getMeetingRooms(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            List<MeetingRoom> rooms = meetingRoomService.getMeetingRoomsByProjectId(projectId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Meeting rooms retrieved successfully", rooms));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse> deleteMeetingRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            meetingRoomService.deleteMeetingRoom(roomId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Meeting room deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // NOTE ENDPOINTS

    @PostMapping("/rooms/{roomId}/notes")
    public ResponseEntity<ApiResponse> createNote(
            @PathVariable Long roomId,
            @Valid @RequestBody CreateNoteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Note note = meetingRoomService.createNote(roomId, request, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Note created successfully", note));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/rooms/{roomId}/notes")
    public ResponseEntity<ApiResponse> getNotes(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            List<Note> notes = meetingRoomService.getNotesByRoomId(roomId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Notes retrieved successfully", notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<ApiResponse> updateNote(
            @PathVariable Long noteId,
            @Valid @RequestBody UpdateNoteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Note note = meetingRoomService.updateNote(noteId, request, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Note updated successfully", note));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<ApiResponse> deleteNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            meetingRoomService.deleteNote(noteId, currentUser.getId());
            return ResponseEntity.ok(new ApiResponse(true, "Note deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}

