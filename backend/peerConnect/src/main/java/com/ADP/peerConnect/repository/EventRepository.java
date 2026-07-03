package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    @Query("""
        SELECT DISTINCT u FROM User u
        WHERE EXISTS (
            SELECT 1 FROM Project p
            JOIN p.team t
            WHERE p.event.id = :eventId AND t.lead = u
        )
        OR EXISTS (
            SELECT 1 FROM Team t
            JOIN t.members u2
            WHERE t.project.event.id = :eventId AND u2 = u
        )
        """)
    List<User> findUsersByEventId(@Param("eventId") Long eventId);

    @Query("""
        SELECT COUNT(DISTINCT u.id) FROM User u
        WHERE EXISTS (
            SELECT 1 FROM Project p
            JOIN p.team t
            WHERE p.event.id = :eventId AND t.lead = u
        )
        OR EXISTS (
            SELECT 1 FROM Team t
            JOIN t.members u2
            WHERE t.project.event.id = :eventId AND u2 = u
        )
        """)
    Long countUsersByEventId(@Param("eventId") Long eventId);

    // Check if a specific user is in any project of an event (lead or member)
    @Query("""
        SELECT COUNT(u) > 0 FROM User u
        WHERE u.id = :userId
        AND (
            EXISTS (
                SELECT 1 FROM Project p
                JOIN p.team t
                WHERE p.event.id = :eventId AND t.lead.id = :userId
            )
            OR EXISTS (
                SELECT 1 FROM Team t
                JOIN t.members m
                WHERE t.project.event.id = :eventId AND m.id = :userId
            )
        )
        """)
    boolean existsByEventIdAndUserId(
            @Param("eventId") Long eventId,
            @Param("userId") String userId);

    List<Event> findTop10ByOrderByStartDateDesc();

    List<Event> findByStatusOrderByStartDateAsc(EventStatus status);
}