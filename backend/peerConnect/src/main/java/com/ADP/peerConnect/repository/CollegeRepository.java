package com.ADP.peerConnect.repository;


import com.ADP.peerConnect.model.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollegeRepository extends JpaRepository<College,Long> {

        // Find a college by its name
        Optional<College> findByName(String name);

        // Check if a college exists by name or code
        boolean existsByName(String name);
    }
