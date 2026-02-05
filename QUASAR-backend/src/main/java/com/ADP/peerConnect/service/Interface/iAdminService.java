package com.ADP.peerConnect.service.Interface;


import com.ADP.peerConnect.model.entity.Mentor;

import java.util.List;

public interface iAdminService {
    public void disableMentor(String userId);
    public Mentor createMentor(
            String email,
            String firstName,
            String lastName,
            String rawPassword
    );
    public List<Mentor> getAllMentors();



}
