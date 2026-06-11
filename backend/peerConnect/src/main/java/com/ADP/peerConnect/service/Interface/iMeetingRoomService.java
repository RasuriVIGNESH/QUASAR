package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.request.Project.CreateMeetingRoomRequest;
import com.ADP.peerConnect.model.dto.request.Project.CreateNoteRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateNoteRequest;
import com.ADP.peerConnect.model.entity.MeetingRoom;
import com.ADP.peerConnect.model.entity.Note;
import java.util.List;

public interface iMeetingRoomService {
    public List<MeetingRoom> getMeetingRoomsByProjectId(String projectId, String userId);
    public MeetingRoom createMeetingRoom(String projectId, CreateMeetingRoomRequest request, String userId) ;
    public void deleteMeetingRoom(Long roomId, String userId) ;
    public List<Note> getNotesByRoomId(Long roomId, String userId);
    public Note createNote(Long roomId, CreateNoteRequest request, String userId) ;
    public Note updateNote(Long noteId, UpdateNoteRequest request, String userId) ;
    public void deleteNote(Long noteId, String userId) ;
}
