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

    @Query("SELECT us FROM UserSkill us JOIN FETCH us.skill JOIN FETCH us.user WHERE us.user.id = :userId ")
    List<UserSkill> findByUserIdWithSkill(@Param("userId") String userId);

    Optional<UserSkill> findByUserIdAndSkillId(String userId, Long skillId);

    @Query("SELECT us FROM UserSkill us JOIN FETCH us.user JOIN FETCH us.skill WHERE us.id = :id")
    Optional<UserSkill> findByIdWithAssociations(@Param("id") Long id);

    @Query("SELECT us FROM UserSkill us JOIN us.skill s WHERE us.user.id = :userId AND LOWER(s.name) = LOWER(:skillName)")
    Optional<UserSkill> findByUserIdAndSkillNameIgnoreCase(@Param("userId") String userId, @Param("skillName") String skillName);

    @Query("SELECT COUNT(us) > 0 FROM UserSkill us JOIN us.skill s WHERE us.user.id = :userId AND LOWER(s.name) = LOWER(:skillName)")
    boolean existsByUserIdAndSkillNameIgnoreCase(@Param("userId") String userId, @Param("skillName") String skillName);

    long countByUserId(String userId);
}
