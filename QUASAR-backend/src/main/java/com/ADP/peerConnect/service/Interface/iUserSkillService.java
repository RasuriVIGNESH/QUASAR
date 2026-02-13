package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.SkillLevel;
import com.ADP.peerConnect.model.dto.request.User.AddUserSkillRequest;

import java.util.List;

public interface iUserSkillService {

    public UserSkill addUserSkill(String userId, String skillName, SkillLevel level, String experience,
            String category);

    public List<UserSkill> getUserSkills(String userId);

    public void removeUserSkill(String userId, Long userSkillId);

    public UserSkill updateUserSkill(String userId, Long userSkillId, SkillLevel level, String experience);

    public UserSkill findById(Long userSkillId);

    public long getUserSkillCount(String userId);

    public boolean userHasSkill(String userId, String skillName);

    // Add multiple skills in a single call
    public List<UserSkill> addUserSkills(String userId, List<AddUserSkillRequest> skills);
}
