package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.model.dto.request.Admin.CreateMentorRequest;
import com.ADP.peerConnect.model.dto.response.MentorResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.Mentor;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.MentorRepository;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.service.Interface.iAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService implements iAdminService {

    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final MentorRepository mentorRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;

    public AdminService( UserRepository userRepository, MentorRepository mentorRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.mentorRepository = mentorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Admin creates a mentor and assigns credentials
     */
    @Transactional
    public String createMentor(CreateMentorRequest request){

        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already exists");
        }

        // generate random password
        String rawPassword = generateRandomPassword(request.getFirstName());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.MENTOR);
        user.setVerified(true);

        User savedUser = userRepository.save(user);

        Mentor mentor = new Mentor();
        mentor.setUser(savedUser);
        mentor.setDepartment(request.getDepartment());
        mentor.setDesignation(request.getDesignation());

        mentorRepository.save(mentor);

        return "Mentor created.\nEmail: "
                + request.getEmail()
                + "\nPassword: "
                + rawPassword;
    }

    private String generateRandomPassword(String firstName){
           return firstName+ "@123";
    }

    /**
     * Disable mentor (soft revoke)
     */
    @Transactional
    public void disableMentor(String userId) {
        Mentor mentor = mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor not found"));

        mentor.setActive(false);
        mentorRepository.save(mentor);
    }
    public List<MentorResponse> getAllMentors() {
        List<MentorResponse> mentors = mentorRepository.findAll().stream()
                .filter(Mentor::isActive)
                .map(mentor -> {
                    User user = mentor.getUser();
                    MentorResponse response = new MentorResponse();
                    response.setId(user.getId());
                    response.setFirstName(user.getFirstName());
                    response.setLastName(user.getLastName());
                    response.setEmail(user.getEmail());
                    response.setBio(user.getBio());
                    return response;
                })
                .toList();
        return mentors;
    }

}
