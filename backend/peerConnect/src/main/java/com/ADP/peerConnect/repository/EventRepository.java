package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT DISTINCT u FROM User u WHERE ( EXISTS (SELECT 1 FROM Project p WHERE p.event.id = :eventId AND p.lead = u) OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.event.id = :eventId AND pm.user = u) )")
    List<User> findUsersByEventId(@Param("eventId") Long eventId);


    @Query("SELECT DISTINCT u.id FROM User u WHERE ( EXISTS (SELECT 1 FROM Project p WHERE p.event.id = :eventId AND p.lead = u) OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.event.id = :eventId AND pm.user = u) )")
    List<String> findUserIdsByEventId(@Param("eventId") Long eventId);


    // Method 3: Count users without loading them
    @Query("SELECT COUNT(DISTINCT u.id) FROM User u WHERE ( EXISTS (SELECT 1 FROM Project p WHERE p.event.id = :eventId AND p.lead = u) OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.event.id = :eventId AND pm.user = u) )")
    Long countUsersByEventId(@Param("eventId") Long eventId);


    @Query("SELECT COUNT(u) FROM User u WHERE u.id = :userId AND ( EXISTS (SELECT 1 FROM Project p WHERE p.event.id = :eventId AND p.lead = u) OR EXISTS (SELECT 1 FROM ProjectMember pm WHERE pm.project.event.id = :eventId AND pm.user = u) )")
    long countUserInEvent(@Param("eventId") Long eventId,
                          @Param("userId") String userId);

    // Derived query to fetch the most recent 10 events by createdAt
    List<Event> findTop10ByOrderByCreatedAtDesc();

    // New: find events by status ordered by start date (useful for upcoming events)
    List<Event> findByStatusOrderByStartDateAsc(com.ADP.peerConnect.model.enums.EventStatus status);

}