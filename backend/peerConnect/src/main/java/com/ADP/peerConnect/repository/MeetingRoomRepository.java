package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.MeetingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRoomRepository extends JpaRepository<MeetingRoom, Long> {
//    List<MeetingRoom> findByProjectId(String projectId);
    @Query("SELECT DISTINCT m FROM MeetingRoom m LEFT JOIN FETCH m.notes WHERE m.project.id = :projectId")
    List<MeetingRoom> findByProjectId(String projectId);
}
