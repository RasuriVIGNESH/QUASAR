package com.ADP.peerConnect.service.Interface;


import com.ADP.peerConnect.model.dto.request.Admin.CreateMentorRequest;
import com.ADP.peerConnect.model.dto.response.MentorResponse;
import com.ADP.peerConnect.model.dto.response.UserResponse;
import com.ADP.peerConnect.model.entity.Mentor;

import java.util.List;

public interface iAdminService {
    public void disableMentor(String userId);
    public String createMentor(CreateMentorRequest request
    );
    public List<MentorResponse> getAllMentors();



}
