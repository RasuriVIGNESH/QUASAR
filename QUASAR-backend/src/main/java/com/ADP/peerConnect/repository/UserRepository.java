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

/**
 * Repository interface for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {


     //Find user by email
    Optional<User> findByEmail(String email);

    //Find user by LinkedIn ID
    Optional<User> findByLinkedinId(String linkedinId);

    //Discover users with filters, excluding current user
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.userSkills us LEFT JOIN us.skill s " +
            "WHERE u.id != :currentUserId " +
            "AND (:branch IS NULL OR u.branch = :branch) " +
            "AND (:graduationYear IS NULL OR u.graduationYear = :graduationYear) " +
            "AND (:availabilityStatus IS NULL OR u.availabilityStatus = :availabilityStatus) " +
            "AND (:skills IS NULL OR s.name IN :skills)")
    Page<User> discoverUsers(@Param("currentUserId") String currentUserId,
                             @Param("branch") String branch,
                             @Param("graduationYear") Integer graduationYear,
                             @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
                             @Param("skills") List<String> skills,
                             Pageable pageable);
     //Check if email exists
    boolean existsByEmail(String email);
    //Check if LinkedIn ID exists
    boolean existsByLinkedinId(String linkedinId);
    
    /**
     * Find users by availability status
     */
    Page<User> findByAvailabilityStatus(AvailabilityStatus status, Pageable pageable);

    Optional<User> findByGithubId(String githubId);
    /**
     * Find users by branch
     */
    Page<User> findByBranch(String branch, Pageable pageable);
    
    /**
     * Find users by graduation year
     */
    Page<User> findByGraduationYear(Integer graduationYear, Pageable pageable);

     //Search users by name (first name or last name)
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<User> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);

     //Find users with specific skills
    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN u.userSkills us " +
           "JOIN us.skill s " +
           "WHERE s.name IN :skillNames")
    Page<User> findBySkillNames(@Param("skillNames") List<String> skillNames, Pageable pageable);
    
    /**
     * Find users available for projects with complementary skills
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "JOIN u.userSkills us " +
           "JOIN us.skill s " +
           "WHERE u.availabilityStatus = 'AVAILABLE' " +
           "AND s.name IN :skillNames " +
           "AND u.id != :excludeUserId")
    Page<User> findAvailableUsersWithSkills(@Param("skillNames") List<String> skillNames, 
                                           @Param("excludeUserId") String excludeUserId, 
                                           Pageable pageable);
    
    /**
     * Search users by multiple criteria
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN u.userSkills us " +
           "LEFT JOIN us.skill s " +
           "WHERE (:name IS NULL OR " +
           "       LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "       LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "       LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:branch IS NULL OR u.branch = :branch) " +
           "AND (:graduationYear IS NULL OR u.graduationYear = :graduationYear) " +
           "AND (:availabilityStatus IS NULL OR u.availabilityStatus = :availabilityStatus) " +
           "AND (:skillNames IS NULL OR s.name IN :skillNames)")
    Page<User> searchUsers(@Param("name") String name,
                          @Param("branch") String branch,
                          @Param("graduationYear") Integer graduationYear,
                          @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
                          @Param("skillNames") List<String> skillNames,
                          Pageable pageable);
}

