package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.model.entity.Mentor;
import com.ADP.peerConnect.repository.MentorRepository;
import com.ADP.peerConnect.service.Interface.iMentorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MentorService implements iMentorService {

    @Autowired
    private final MentorRepository mentorRepository;

    public MentorService(MentorRepository mentorRepository) {
        this.mentorRepository = mentorRepository;
    }

    public Mentor getMentorByUserId(String userId) {
        return mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor not found"));
    }

    public List<Mentor> getActiveMentors() {
        return mentorRepository.findByActiveTrue();
    }

    public Mentor updateMentorProfile(
            Mentor mentor,
            String department,
            String designation,
            Integer maxMentees
    ) {
        mentor.setDepartment(department);
        mentor.setDesignation(designation);
        return mentorRepository.save(mentor);
    }
}
