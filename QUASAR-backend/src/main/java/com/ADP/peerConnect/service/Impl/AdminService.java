package com.ADP.peerConnect.service.Impl;

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
    public Mentor createMentor(
            String email,
            String firstName,
            String lastName,
            String rawPassword
    ) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("User already exists with email");
        }

        // 1. Create User
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(Role.MENTOR);
        user.setVerified(true);

        userRepository.save(user);

        // 2. Create Mentor
        Mentor mentor = new Mentor(user);
        return mentorRepository.save(mentor);
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
    public List<Mentor> getAllMentors() {
        return mentorRepository.findAll();
    }

}
