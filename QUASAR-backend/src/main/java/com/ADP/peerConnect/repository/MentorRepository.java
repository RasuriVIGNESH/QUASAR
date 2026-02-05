package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserId(String userId);

    boolean existsByUserId(String userId);

    List<Mentor> findByActiveTrue();
}
