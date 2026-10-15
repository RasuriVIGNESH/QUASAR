package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Team;
import com.ADP.peerConnect.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepo extends JpaRepository<Team, String> {

    // ── Lookup ────────────────────────────────────────────────────────────────

    @Query("""
        SELECT t FROM Team t
        JOIN FETCH t.lead
        JOIN FETCH t.members
        WHERE t.project.id = :projectId
        """)
    Optional<Team> findByProjectIdWithMembers(@Param("projectId") String projectId);

    @Query("""
        SELECT t FROM Team t
        JOIN FETCH t.lead
        WHERE t.project.id = :projectId
        """)
    Optional<Team> findByProjectId(@Param("projectId") String projectId);

    // ── Member checks ─────────────────────────────────────────────────────────

    @Query("""
        SELECT COUNT(u) > 0 FROM Team t
        JOIN t.members u
        WHERE t.project.id = :projectId AND u.id = :userId
        """)
    boolean existsByProjectIdAndUserId(
            @Param("projectId") String projectId,
            @Param("userId") String userId);

    @Query("""
SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END
FROM Team t
WHERE t.project.id = :projectId
AND (t.lead.id = :userId OR :userId IN (SELECT m.id FROM t.members m))
""")
    Boolean isInTeam(@Param("projectId") String projectId, @Param("userId") String userId);

    @Query("""
        SELECT t.lead.id = :userId FROM Team t
        WHERE t.project.id = :projectId
        """)
    Boolean isLead(
            @Param("projectId") String projectId,
            @Param("userId") String userId);

    // ── Member count ──────────────────────────────────────────────────────────

    @Query("""
        SELECT COUNT(u) FROM Team t
        JOIN t.members u
        WHERE t.project.id = :projectId
        """)
    int countByProjectId(@Param("projectId") String projectId);

    // ── Member list ───────────────────────────────────────────────────────────

    @Query("""
    SELECT u
    FROM Team t
    JOIN t.members u
    WHERE t.project.id = :projectId
    """)
    List<User> getAllMembers(@Param("projectId") String projectId);

    @Query("""
    SELECT t.lead
    FROM Team t
    WHERE t.project.id = :projectId
    """)
    User getLead(@Param("projectId") String projectId);

    @Query("""
    SELECT u.profilePictureUrl
    FROM Team t
    JOIN t.members u
    WHERE t.project.id = :projectId AND u.profilePictureUrl IS NOT NULL
    """)
    List<String> getMemberProfileImageUrls(@Param("projectId") String projectId);

    /** Counts recruiting/in-progress projects per candidate in one query; avoids per-user workload queries. */
    @Query(value = """
        SELECT project_members.user_id AS "userId",
               COUNT(DISTINCT project_members.project_id) AS "projectCount"
        FROM (
            SELECT t.lead_id AS user_id, t.project_id AS project_id
            FROM teams t
            UNION ALL
            SELECT tm.user_id AS user_id, t.project_id AS project_id
            FROM team_members tm
            JOIN teams t ON t.id = tm.team_id
        ) project_members
        JOIN projects p ON p.id = project_members.project_id
        WHERE project_members.user_id IN (:userIds)
          AND p.status IN ('RECRUITING', 'IN_PROGRESS')
        GROUP BY project_members.user_id
        """, nativeQuery = true)
    List<UserProjectCountProjection> findActiveProjectCountsByUserIds(@Param("userIds") List<String> userIds);
    
    // ── Mutations ─────────────────────────────────────────────────────────────

    @Modifying
    @Query(value = """
        INSERT INTO team_members (team_id, user_id)
        SELECT t.id, :userId FROM teams t
        WHERE t.project_id = :projectId
        """, nativeQuery = true)
    void addMember(
            @Param("projectId") String projectId,
            @Param("userId") String userId);

    @Modifying
    @Query(value = """
        DELETE FROM team_members
        WHERE team_id = (SELECT id FROM teams WHERE project_id = :projectId)
        AND user_id = :userId
        """, nativeQuery = true)
    void removeMember(
            @Param("projectId") String projectId,
            @Param("userId") String userId);

    @Query("""
        SELECT DISTINCT t FROM Team t
        JOIN FETCH t.lead
        LEFT JOIN FETCH t.members
        WHERE t.project.id = :projectId
        """)
    Optional<Team> findTeamWithLeadAndMembers(@Param("projectId") String projectId);
}
