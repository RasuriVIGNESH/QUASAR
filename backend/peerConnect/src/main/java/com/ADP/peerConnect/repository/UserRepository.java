package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

       Optional<User> findByEmail(String email);

       Optional<User> findByLinkedinId(String linkedinId);

       Optional<User> findByGithubId(String githubId);

       boolean existsByEmail(String email);

       boolean existsByLinkedinId(String linkedinId);

       Page<User> findByAvailabilityStatus(AvailabilityStatus status, Pageable pageable);

       Page<User> findByBranch(String branch, Pageable pageable);

       Page<User> findByGraduationYear(Integer graduationYear, Pageable pageable);

       @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.college
        WHERE u.id != :currentUserId
        AND u.role = com.ADP.peerConnect.model.enums.Role.STUDENT
        AND (:branch IS NULL OR u.branch = :branch)
        AND (:graduationYear IS NULL OR u.graduationYear = :graduationYear)
        AND (:availabilityStatus IS NULL OR u.availabilityStatus = :availabilityStatus)
        AND (
            :skills IS NULL OR EXISTS (
                SELECT 1 FROM UserSkill us2
                JOIN us2.skill s2
                WHERE us2.user = u AND s2.name IN :skills
            )
        )
        """)
       Page<User> discoverUsers(
               @Param("currentUserId") String currentUserId,
               @Param("branch") String branch,
               @Param("graduationYear") Integer graduationYear,
               @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
               @Param("skills") List<String> skills,
               Pageable pageable);

       @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.college
        WHERE LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%'))
        OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%'))
        OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))
        """)
       Page<User> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

       @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.college
        JOIN u.userSkills us
        JOIN us.skill s
        WHERE s.name IN :skillNames
        """)
       Page<User> findBySkillNames(@Param("skillNames") List<String> skillNames, Pageable pageable);

       @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.college
        JOIN u.userSkills us
        JOIN us.skill s
        WHERE u.availabilityStatus = 'AVAILABLE'
        AND s.name IN :skillNames
        AND u.id != :excludeUserId
        """)
       Page<User> findAvailableUsersWithSkills(
               @Param("skillNames") List<String> skillNames,
               @Param("excludeUserId") String excludeUserId,
               Pageable pageable);

       @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.college
        WHERE (:name IS NULL OR
               LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR
               LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR
               LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%')))
        AND (:branch IS NULL OR u.branch = :branch)
        AND (:graduationYear IS NULL OR u.graduationYear = :graduationYear)
        AND (:availabilityStatus IS NULL OR u.availabilityStatus = :availabilityStatus)
        AND (
            :skillNames IS NULL OR EXISTS (
                SELECT 1 FROM UserSkill us2
                JOIN us2.skill s2
                WHERE us2.user = u AND s2.name IN :skillNames
            )
        )
        """)
       Page<User> searchUsers(
               @Param("name") String name,
               @Param("branch") String branch,
               @Param("graduationYear") Integer graduationYear,
               @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
               @Param("skillNames") List<String> skillNames,
               Pageable pageable);
}