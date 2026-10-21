package com.ADP.peerConnect.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ADP.peerConnect.model.entity.Skill;
import java.util.Collection;
import java.util.List;

/** Database-side skill-demand aggregation; counts distinct active projects, not duplicate mentions. */
@Repository
public interface SkillInsightsRepository extends JpaRepository<Skill, Long> {

    @Query(value = """
            SELECT s.id AS "skillId",
                   s.name AS "skillName",
                   s.category AS "category",
                   COUNT(DISTINCT p.id) AS "activeProjectCount",
                   COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'RECRUITING') AS "recruitingProjectCount",
                   COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'IN_PROGRESS') AS "inProgressProjectCount"
            FROM project_skills ps
            JOIN skills s ON s.id = ps.skill_id
            JOIN projects p ON p.id = ps.project_id
            WHERE p.status IN ('RECRUITING', 'IN_PROGRESS')
              AND (:categoryFilter = '' OR LOWER(COALESCE(s.category, '')) = LOWER(:categoryFilter))
              AND (:searchFilter = '' OR LOWER(s.name) LIKE CONCAT('%', LOWER(:searchFilter), '%'))
            GROUP BY s.id, s.name, s.category
            ORDER BY "recruitingProjectCount" DESC,
                     "activeProjectCount" DESC,
                     LOWER(s.name) ASC,
                     s.id ASC
            """,
            countQuery = """
            SELECT COUNT(DISTINCT s.id)
            FROM project_skills ps
            JOIN skills s ON s.id = ps.skill_id
            JOIN projects p ON p.id = ps.project_id
            WHERE p.status IN ('RECRUITING', 'IN_PROGRESS')
              AND (:categoryFilter = '' OR LOWER(COALESCE(s.category, '')) = LOWER(:categoryFilter))
              AND (:searchFilter = '' OR LOWER(s.name) LIKE CONCAT('%', LOWER(:searchFilter), '%'))
            """,
            nativeQuery = true)
    org.springframework.data.domain.Page<SkillDemandProjection> findActiveDemand(
            @Param("categoryFilter") String categoryFilter,
            @Param("searchFilter") String searchFilter,
            Pageable pageable);

    @Query(value = """
            SELECT s.id AS "skillId",
                   s.name AS "skillName",
                   s.category AS "category",
                   COUNT(DISTINCT p.id) AS "activeProjectCount",
                   COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'RECRUITING') AS "recruitingProjectCount",
                   COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'IN_PROGRESS') AS "inProgressProjectCount"
            FROM project_skills ps
            JOIN skills s ON s.id = ps.skill_id
            JOIN projects p ON p.id = ps.project_id
            WHERE p.status IN ('RECRUITING', 'IN_PROGRESS')
              AND s.id IN (:skillIds)
            GROUP BY s.id, s.name, s.category
            ORDER BY "recruitingProjectCount" DESC,
                     "activeProjectCount" DESC,
                     LOWER(s.name) ASC,
                     s.id ASC
            """, nativeQuery = true)
    List<SkillDemandProjection> findActiveDemandForSkillIds(@Param("skillIds") Collection<Long> skillIds);

    @Query(value = """
            SELECT s.id AS "skillId",
                   s.name AS "skillName",
                   s.category AS "category",
                   COUNT(DISTINCT p.id) AS "activeProjectCount",
                   COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'RECRUITING') AS "recruitingProjectCount",
                   COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'IN_PROGRESS') AS "inProgressProjectCount"
            FROM project_skills ps
            JOIN skills s ON s.id = ps.skill_id
            JOIN projects p ON p.id = ps.project_id
            WHERE p.status IN ('RECRUITING', 'IN_PROGRESS')
              AND NOT EXISTS (
                  SELECT 1 FROM user_skills us
                  WHERE us.user_id = :studentId AND us.skill_id = s.id
              )
            GROUP BY s.id, s.name, s.category
            ORDER BY "recruitingProjectCount" DESC,
                     "activeProjectCount" DESC,
                     LOWER(s.name) ASC,
                     s.id ASC
            """, nativeQuery = true)
    List<SkillDemandProjection> findTopMissingDemandForStudent(
            @Param("studentId") String studentId,
            Pageable pageable);
}
