package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.request.User.UpdateUserRequest;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Optional;

public interface iUserService  {

    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException; // Load user by ID for JWT authentication
    public UserDetails loadUserById(String id) ;

    public int getUserCount() ;
    public User findById(String id);
    public Optional<User> findByEmail(String email) ;
    public Optional<User> findByLinkedinId(String linkedinId) ;
    public boolean existsByEmail(String email) ;

    public boolean existsByLinkedinId(String linkedinId) ;

    public User save(User user) ;
    public User update(User user) ;

    public UserResponse updateUserProfile(String userId, UpdateUserRequest updateRequest) ;



    public void delete(String id) ;

    public Page<User> findAll(Pageable pageable);


    public Page<User> discoverUsers(String currentUserId, String branch,
                                    Integer graduationYear, AvailabilityStatus availabilityStatus,
                                    List<String> skills, Pageable pageable);
    public Page<User> searchUsers(String name, String branch, Integer graduationYear,
                                  AvailabilityStatus availabilityStatus, List<String> skillNames,
                                  Pageable pageable);
    public User updateAvailabilityStatus(String userId, AvailabilityStatus status);

    public User updateProfilePhoto(String userId, byte[] profilePhotoData);
    public void deleteProfilePhoto(String userId);


    public Page<User> findByBranch(String branch, Pageable pageable);
    public Page<User> findByGraduationYear(Integer graduationYear, Pageable pageable);
    public Page<User> searchByName(String name, Pageable pageable);
    public Page<User> findBySkillNames(List<String> skillNames, Pageable pageable) ;
    public Page<User> findAvailableUsersWithSkills(List<String> skillNames, String excludeUserId, Pageable pageable) ;
    public Page<User> findByAvailabilityStatus(AvailabilityStatus status, Pageable pageable) ;
    public User updateProfilePicture(String userId, String profilePictureUrl) ;

}
