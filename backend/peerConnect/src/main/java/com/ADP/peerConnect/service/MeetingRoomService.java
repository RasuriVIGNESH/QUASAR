package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.MeetingRoom;
import com.ADP.peerConnect.model.entity.Note;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.dto.request.Project.CreateMeetingRoom;
import com.ADP.peerConnect.model.dto.request.Project.CreateNote;
import com.ADP.peerConnect.model.dto.request.Project.UpdateNote;
import com.ADP.peerConnect.repository.MeetingRoomRepository;
import com.ADP.peerConnect.repository.NoteRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MeetingRoomService {

    private final MeetingRoomRepository meetingRoomRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;
    private final TeamService teamService;

    @Autowired
    public MeetingRoomService(MeetingRoomRepository meetingRoomRepository,
                              NoteRepository noteRepository,
                              UserRepository userRepository,
                              ProjectService projectService, TeamService teamService) {
        this.meetingRoomRepository = meetingRoomRepository;
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
        this.teamService = teamService;
    }

    // Meeting Room Methods
    @Transactional(readOnly = true)
    public List<MeetingRoom> getMeetingRoomsByProjectId(String projectId, String userId) {
        if (!projectService.isProjectMember(projectId, userId)) {
            throw new ForbiddenException("User is not a member of this project.");
        }
        return meetingRoomRepository.findByProjectId(projectId);
    }

    public MeetingRoom createMeetingRoom(String projectId, CreateMeetingRoom request, String userId) {
        Project project = projectService.findById(projectId);

        if (!teamService.isLead(projectId,userId)) {
            throw new ForbiddenException("Only the project lead can create meeting rooms.");
        }

        MeetingRoom newRoom = new MeetingRoom();
        newRoom.setProject(project);
        newRoom.setName(request.getName());
        newRoom.setDescription(request.getDescription());
        newRoom.setDepartment(request.getDepartment());

        return meetingRoomRepository.save(newRoom);
    }

    public void deleteMeetingRoom(Long roomId, String userId) {
        MeetingRoom room = meetingRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting room not found"));

        if (!teamService.isLead(room.getProject().getId(),userId)) {
            throw new ForbiddenException("Only the project lead can delete meeting rooms.");
        }
        meetingRoomRepository.delete(room);
    }

    // Note Methods
    public List<Note> getNotesByRoomId(Long roomId, String userId) {
        MeetingRoom room = meetingRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting room not found"));
        if (!projectService.isProjectMember(room.getProject().getId(), userId)) {
            throw new ForbiddenException("User is not a member of this project.");
        }
        return noteRepository.findByMeetingRoomIdOrderByCreatedAtDesc(roomId);
    }

    public Note createNote(Long roomId, CreateNote request, String userId) {
        MeetingRoom room = meetingRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting room not found"));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!projectService.isProjectMember(room.getProject().getId(), userId)) {
            throw new ForbiddenException("User is not a member of this project.");
        }

        Note newNote = new Note();
        newNote.setMeetingRoom(room);
        newNote.setAuthor(author);
        newNote.setTitle(request.getTitle());
        newNote.setContent(request.getContent());

        return noteRepository.save(newNote);
    }

    public Note updateNote(Long noteId, UpdateNote request, String userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException("Only the author can edit this note.");
        }

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        return noteRepository.save(note);
    }

    public void deleteNote(Long noteId, String userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        if (!note.getAuthor().getId().equals(userId) && !teamService.isLead(note.getMeetingRoom().getProject().getId(),userId)) {
            throw new ForbiddenException("Only the author or project lead can delete this note.");
        }
        noteRepository.delete(note);
    }
}
