package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.Mentor;

import java.util.List;

public interface iMentorService {
    public Mentor getMentorByUserId(String userId);
    public List<Mentor> getActiveMentors();
    public Mentor updateMentorProfile(
            Mentor mentor,
            String department,
            String designation,
            Integer maxMentees
    );
}
