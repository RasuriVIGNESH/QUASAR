package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Mentor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserId(String userId);

    List<Mentor> findByActiveTrue();

    @Query(value = "SELECT m FROM Mentor m JOIN FETCH m.user WHERE m.active = true",
            countQuery = "SELECT COUNT(m) FROM Mentor m WHERE m.active = true")
    Page<Mentor> findActiveWithUser(Pageable pageable);
}
