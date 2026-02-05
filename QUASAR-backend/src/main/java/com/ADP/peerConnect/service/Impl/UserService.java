package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.dto.request.User.UpdateUserRequest;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.User; // Corrected import from previous turn
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.Interface.iUserService;
import com.ADP.peerConnect.util.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // --- ADD THIS IMPORT ---
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for User entity operations
 */
@Service
@Transactional
// --- UPDATE THIS LINE ---
public class UserService implements iUserService, UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    // modelMapper removed; constructing DTOs directly where needed

    // This method is now correctly overriding the UserDetailsService interface
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return UserPrincipal.create(user);
    }

    /**
     * Load user by ID for JWT authentication
     */
    public UserDetails loadUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));

        return UserPrincipal.create(user);
    }

    @Override
    public int getUserCount() {
        return (int) userRepository.count();
    }

    /**
     * Find user by ID
     */
    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(Constants.USER_NOT_FOUND));
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Find user by LinkedIn ID
     */
    public Optional<User> findByLinkedinId(String linkedinId) {
        return userRepository.findByLinkedinId(linkedinId);
    }

    /**
     * Check if email exists
     */
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Check if LinkedIn ID exists
     */
    public boolean existsByLinkedinId(String linkedinId) {
        return userRepository.existsByLinkedinId(linkedinId);
    }

    /**
     * Save user
     */
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Update user
     */
    public User update(User user) {
        return userRepository.save(user);
    }

    public UserResponse updateUserProfile(String userId, UpdateUserRequest updateRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (updateRequest.getFirstName() != null) user.setFirstName(updateRequest.getFirstName());
        if (updateRequest.getLastName() != null) user.setLastName(updateRequest.getLastName());
        if (updateRequest.getBio() != null) user.setBio(updateRequest.getBio());
        if (updateRequest.getBranch() != null) user.setBranch(updateRequest.getBranch());
        if (updateRequest.getGraduationYear() != null) user.setGraduationYear(updateRequest.getGraduationYear());
        if (updateRequest.getAvailabilityStatus() != null) user.setAvailabilityStatus(updateRequest.getAvailabilityStatus());
        if (updateRequest.getProfilePictureUrl() != null) user.setProfilePictureUrl(updateRequest.getProfilePictureUrl());

        if (updateRequest.getGithubUrl() != null) user.setGithubUrl(updateRequest.getGithubUrl());
        if (updateRequest.getLinkedinUrl() != null) user.setLinkedinUrl(updateRequest.getLinkedinUrl());
        if (updateRequest.getPortfolioUrl() != null) user.setPortfolioUrl(updateRequest.getPortfolioUrl());

        userRepository.save(user);

        return new UserResponse(user);
    }


    /**
     * Delete user
     */
    public void delete(String id) {
        User user = findById(id);
        userRepository.delete(user);
    }

    /**
     * Get all users with pagination
     */
    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Find users by availability status
     */
    public Page<User> findByAvailabilityStatus(AvailabilityStatus status, Pageable pageable) {
        return userRepository.findByAvailabilityStatus(status, pageable);
    }
    /**
     * Discover users with filters, excluding current user
     */
    public Page<User> discoverUsers(String currentUserId, String branch,
                                    Integer graduationYear, AvailabilityStatus availabilityStatus,
                                    List<String> skills, Pageable pageable) {

        return userRepository.discoverUsers(currentUserId, branch, graduationYear,
                availabilityStatus, skills, pageable);
    }

    /**
     * Find users by branch
     */
    public Page<User> findByBranch(String branch, Pageable pageable) {
        return userRepository.findByBranch(branch, pageable);
    }

    /**
     * Find users by graduation year
     */
    public Page<User> findByGraduationYear(Integer graduationYear, Pageable pageable) {
        return userRepository.findByGraduationYear(graduationYear, pageable);
    }

    /**
     * Search users by name
     */
    public Page<User> searchByName(String name, Pageable pageable) {
        return userRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    /**
     * Find users with specific skills
     */
    public Page<User> findBySkillNames(List<String> skillNames, Pageable pageable) {
        return userRepository.findBySkillNames(skillNames, pageable);
    }

    /**
     * Find available users with complementary skills
     */
    public Page<User> findAvailableUsersWithSkills(List<String> skillNames, String excludeUserId, Pageable pageable) {
        return userRepository.findAvailableUsersWithSkills(skillNames, excludeUserId, pageable);
    }

    /**
     * Search users by multiple criteria
     */
    public Page<User> searchUsers(String name, String branch, Integer graduationYear,
                                  AvailabilityStatus availabilityStatus, List<String> skillNames,
                                  Pageable pageable) {
        return userRepository.searchUsers(name, branch, graduationYear, availabilityStatus, skillNames, pageable);
    }

    /**
     * Update user availability status
     */
    public User updateAvailabilityStatus(String userId, AvailabilityStatus status) {
        User user = findById(userId);
        user.setAvailabilityStatus(status);
        return save(user);
    }

    /**
     * Update user profile picture
     */
    public User updateProfilePicture(String userId, String profilePictureUrl) {
        User user = findById(userId);
        user.setProfilePictureUrl(profilePictureUrl);
        return save(user);
    }

    /**
     * Update user profile photo
     */
    public User updateProfilePhoto(String userId, byte[] profilePhotoData) {
        User user = findById(userId);
        user.setProfilePhoto(profilePhotoData);
        return save(user);
    }

    /**
     * Delete user profile photo
     */
    public void deleteProfilePhoto(String userId) {
        User user = findById(userId);
        user.setProfilePhoto(null);
        save(user);
    }
}
