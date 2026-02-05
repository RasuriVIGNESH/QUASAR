package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectCategoryRepository extends JpaRepository<ProjectCategory, Long> {
    List<ProjectCategory> findByNameContainingIgnoreCase(String name);
    Optional<ProjectCategory> findByName(String name);
}

