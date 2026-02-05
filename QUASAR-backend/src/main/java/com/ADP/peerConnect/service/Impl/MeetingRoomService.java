package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.model.entity.MeetingRoom;
import com.ADP.peerConnect.model.entity.Note;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.dto.request.Project.CreateMeetingRoomRequest;
import com.ADP.peerConnect.model.dto.request.Project.CreateNoteRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateNoteRequest;
import com.ADP.peerConnect.repository.MeetingRoomRepository;
import com.ADP.peerConnect.repository.NoteRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.service.Interface.iMeetingRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class MeetingRoomService implements iMeetingRoomService {

    private final MeetingRoomRepository meetingRoomRepository;
    private final NoteRepository noteRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectService projectService;

    @Autowired
    public MeetingRoomService(MeetingRoomRepository meetingRoomRepository,
                              NoteRepository noteRepository,
                              ProjectRepository projectRepository,
                              UserRepository userRepository,
                              ProjectService projectService) {
        this.meetingRoomRepository = meetingRoomRepository;
        this.noteRepository = noteRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    // Meeting Room Methods
    public List<MeetingRoom> getMeetingRoomsByProjectId(String projectId, String userId) {
        if (!projectService.isUserMemberOrLead(projectId, userId)) {
            throw new AccessDeniedException("User is not a member of this project.");
        }
        return meetingRoomRepository.findByProjectId(projectId);
    }

    public MeetingRoom createMeetingRoom(String projectId, CreateMeetingRoomRequest request, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        if (!project.isLead(userId)) {
            throw new AccessDeniedException("Only the project lead can create meeting rooms.");
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
                .orElseThrow(() -> new EntityNotFoundException("Meeting room not found"));

        if (!room.getProject().isLead(userId)) {
            throw new AccessDeniedException("Only the project lead can delete meeting rooms.");
        }
        meetingRoomRepository.delete(room);
    }

    // Note Methods
    public List<Note> getNotesByRoomId(Long roomId, String userId) {
        MeetingRoom room = meetingRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Meeting room not found"));
        if (!projectService.isUserMemberOrLead(room.getProject().getId(), userId)) {
            throw new AccessDeniedException("User is not a member of this project.");
        }
        return noteRepository.findByMeetingRoomIdOrderByCreatedAtDesc(roomId);
    }

    public Note createNote(Long roomId, CreateNoteRequest request, String userId) {
        MeetingRoom room = meetingRoomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Meeting room not found"));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!projectService.isUserMemberOrLead(room.getProject().getId(), userId)) {
            throw new AccessDeniedException("User is not a member of this project.");
        }

        Note newNote = new Note();
        newNote.setMeetingRoom(room);
        newNote.setAuthor(author);
        newNote.setTitle(request.getTitle());
        newNote.setContent(request.getContent());

        return noteRepository.save(newNote);
    }

    public Note updateNote(Long noteId, UpdateNoteRequest request, String userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));

        if (!note.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("Only the author can edit this note.");
        }

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        return noteRepository.save(note);
    }

    public void deleteNote(Long noteId, String userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));

        if (!note.getAuthor().getId().equals(userId) && !note.getMeetingRoom().getProject().isLead(userId)) {
            throw new AccessDeniedException("Only the author or project lead can delete this note.");
        }
        noteRepository.delete(note);
    }
}
