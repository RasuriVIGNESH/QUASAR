package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    boolean existsByEventIdAndUserId(Long eventId, String userId);
    List<EventRegistration> findByEventId(Long eventId);
}
