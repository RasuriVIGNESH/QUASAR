package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserSkill entity
 */
@Repository
public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    
    /**
     * Find user skills by user ID
     */
    List<UserSkill> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find user skill by user ID and skill ID
     */
    Optional<UserSkill> findByUserIdAndSkillId(String userId, Long skillId);

    /**
     * Find user skill by user ID and skill name (case insensitive)
     */
    @Query("SELECT us FROM UserSkill us JOIN us.skill s WHERE us.user.id = :userId AND LOWER(s.name) = LOWER(:skillName)")
    Optional<UserSkill> findByUserIdAndSkillNameIgnoreCase(@Param("userId") String userId, @Param("skillName") String skillName);
    
    /**
     * Check if user has a specific skill
     */
    @Query("SELECT COUNT(us) > 0 FROM UserSkill us JOIN us.skill s WHERE us.user.id = :userId AND LOWER(s.name) = LOWER(:skillName)")
    boolean existsByUserIdAndSkillNameIgnoreCase(@Param("userId") String userId, @Param("skillName") String skillName);
    
    /**
     * Delete user skill by user ID and skill ID
     */
    void deleteByUserIdAndId(String userId, Long userSkillId);

    /**
     * Count skills for a user
     */
    long countByUserId(String userId);
}
