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
    boolean isInTeam(@Param("projectId") String projectId, @Param("userId") String userId);

    @Query("""
        SELECT t.lead.id = :userId FROM Team t
        WHERE t.project.id = :projectId
        """)
    boolean isLead(
            @Param("projectId") String projectId,
            @Param("userId") String userId);

    // ── Member count ──────────────────────────────────────────────────────────

    @Query("""
        SELECT COUNT(u) FROM Team t
        JOIN t.members u
        WHERE t.project.id = :projectId
        """)
    long countByProjectId(@Param("projectId") String projectId);

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
}