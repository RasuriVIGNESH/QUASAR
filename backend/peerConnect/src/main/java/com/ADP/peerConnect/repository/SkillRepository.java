package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    Optional<Skill> findByNormalizedName(String normalizedName);

    boolean existsByNormalizedName(String normalizedName);

    Page<Skill> findByCategoryIgnoreCase(String category, Pageable pageable);
    @Query("SELECT DISTINCT s.category FROM Skill s WHERE s.category IS NOT NULL ORDER BY s.category")
    List<String> findAllCategories();

    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY s.name")
    Page<Skill> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    @Query("""
        SELECT s FROM Skill s
        JOIN s.userSkills us
        GROUP BY s
        ORDER BY COUNT(us) DESC
    """)
    Page<Skill> findPopularSkills(Pageable pageable);
}
