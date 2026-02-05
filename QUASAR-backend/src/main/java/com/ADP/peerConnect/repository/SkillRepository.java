package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    /* ------------------------
       Basic lookups
     ------------------------ */

    Optional<Skill> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    Optional<Skill> findByNormalizedName(String normalizedName);

    boolean existsByNormalizedName(String normalizedName);


    /* ------------------------
       Predefined & category
     ------------------------ */

    List<Skill> findByIsPredefinedTrueOrderByNameAsc();

    Page<Skill> findByCategoryIgnoreCase(String category, Pageable pageable);

    List<Skill> findByCategoryOrderByUsersCountDesc(String category);

    @Query("SELECT DISTINCT s.category FROM Skill s WHERE s.category IS NOT NULL ORDER BY s.category")
    List<String> findAllCategories();


    /* ------------------------
       Name search
     ------------------------ */

    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY s.name")
    Page<Skill> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY s.usersCount DESC, s.name ASC")
    List<Skill> searchSkills(@Param("search") String search, Pageable pageable);


    /* ------------------------
       Batch lookups
     ------------------------ */

    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) IN :names")
    List<Skill> findByNameInIgnoreCase(@Param("names") List<String> names);


    /* ------------------------
       Popular / top / trending
     ------------------------ */

    @Query("""
        SELECT s FROM Skill s
        JOIN s.userSkills us
        GROUP BY s
        ORDER BY COUNT(us) DESC
    """)
    Page<Skill> findPopularSkills(Pageable pageable);

    List<Skill> findTopByOrderByUsersCountDesc(Pageable pageable);

    List<Skill> findTopByOrderByProjectsCountDesc(Pageable pageable);

    List<Skill> findByIsPredefinedTrueOrderByUsersCountDesc(Pageable pageable);

    @Query("""
        SELECT s FROM Skill s 
        WHERE s.createdAt >= CURRENT_DATE - 30 
        ORDER BY s.usersCount DESC, s.projectsCount DESC
    """)
    List<Skill> findTrendingSkills(Pageable pageable);


    /* ------------------------
       Filters
     ------------------------ */

    List<Skill> findByUsersCountAndProjectsCount(Integer usersCount,
                                                 Integer projectsCount);

    @Query("SELECT s FROM Skill s WHERE s.category = :category AND s.usersCount >= :minUsers ORDER BY s.usersCount DESC")
    List<Skill> findPopularSkillsByCategory(@Param("category") String category,
                                            @Param("minUsers") Integer minUsers);


    /* ------------------------
       Recommendation queries
     ------------------------ */

    @Query("""
        SELECT s FROM Skill s 
        WHERE s.id IN (
            SELECT us2.skill.id FROM UserSkill us2 
            WHERE us2.user.id IN (
                SELECT us1.user.id FROM UserSkill us1 
                WHERE us1.skill.id IN :skillIds
            )
            AND us2.skill.id NOT IN :skillIds
            GROUP BY us2.skill.id
            ORDER BY COUNT(us2.skill.id) DESC
        )
    """)
    List<Skill> findRecommendedSkillsForUser(@Param("skillIds") List<Long> skillIds,
                                             Pageable pageable);

    @Query("""
        SELECT s FROM Skill s 
        WHERE s.id IN (
            SELECT ps2.skill.id FROM ProjectSkill ps2 
            WHERE ps2.project.id IN (
                SELECT ps1.project.id FROM ProjectSkill ps1 
                WHERE ps1.skill.id IN :skillIds
            )
            AND ps2.skill.id NOT IN :skillIds
            GROUP BY ps2.skill.id
            ORDER BY COUNT(ps2.skill.id) DESC
        )
    """)
    List<Skill> findComplementarySkillsForProject(@Param("skillIds") List<Long> skillIds,
                                                  Pageable pageable);

}
