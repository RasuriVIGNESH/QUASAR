package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.SkillLevel;
import com.ADP.peerConnect.repository.UserSkillRepository;
import com.ADP.peerConnect.service.Interface.iUserSkillService;
import com.ADP.peerConnect.model.dto.request.User.AddUserSkillRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service class for UserSkill entity operations
 */
@Service
@Transactional
public class UserSkillService implements iUserSkillService {

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private SkillService skillService;

    /**
     * Add skill to user
     */
    /**
     * Add skill to user
     */
    public UserSkill addUserSkill(String userId, String skillName, SkillLevel level, String experience,
            String category) {
        // Validate input
        if (skillName == null || skillName.trim().isEmpty()) {
            throw new BadRequestException("Skill name is required");
        }

        if (level == null) {
            throw new BadRequestException("Skill level is required");
        }

        // Check if user already has this skill
        if (userSkillRepository.existsByUserIdAndSkillNameIgnoreCase(userId, skillName)) {
            throw new ConflictException("User already has this skill");
        }

        // Get or create skill
        Skill skill = skillService.findOrCreateSkill(skillName, category);

        // Get user
        User user = userService.findById(userId);

        // Create user skill
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setLevel(level);
        userSkill.setExperience(experience);

        UserSkill saved = userSkillRepository.save(userSkill);

        // Increment the skill's users count
        skillService.incrementUsers(skill);

        return saved;
    }

    /**
     * Add multiple skills to a user in batch; skips skills that already exist and
     * returns the newly added skills
     */
    @Override
    public List<UserSkill> addUserSkills(String userId, List<AddUserSkillRequest> skills) {
        if (skills == null || skills.isEmpty()) {
            throw new BadRequestException("Skill list is required");
        }

        User user = userService.findById(userId);
        List<UserSkill> toSave = new ArrayList<>();
        List<UserSkill> added = new ArrayList<>();

        for (AddUserSkillRequest req : skills) {
            String skillName = req.getSkillName();
            SkillLevel level = req.getLevel();
            String experience = req.getExperience();
            String category = req.getCategory();

            if (skillName == null || skillName.trim().isEmpty()) {
                // skip invalid entries
                continue;
            }
            if (level == null) {
                // skip invalid entries
                continue;
            }

            // If user already has the skill, skip
            if (userSkillRepository.existsByUserIdAndSkillNameIgnoreCase(userId, skillName)) {
                continue;
            }

            Skill skill = skillService.findOrCreateSkill(skillName, category);

            UserSkill userSkill = new UserSkill();
            userSkill.setUser(user);
            userSkill.setSkill(skill);
            userSkill.setLevel(level);
            userSkill.setExperience(experience);

            toSave.add(userSkill);
        }

        if (!toSave.isEmpty()) {
            List<UserSkill> saved = userSkillRepository.saveAll(toSave);
            // increment users count for each skill
            for (UserSkill us : saved) {
                skillService.incrementUsers(us.getSkill());
            }
            added.addAll(saved);
        }

        return added;
    }

    /**
     * Get user skills
     */
    public List<UserSkill> getUserSkills(String userId) {
        return userSkillRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Remove user skill
     */
    public void removeUserSkill(String userId, Long userSkillId) {
        UserSkill userSkill = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("User skill not found"));

        // Verify the skill belongs to the user
        if (!userSkill.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove skill that doesn't belong to the user");
        }

        // Save reference to skill before deletion
        Skill skill = userSkill.getSkill();

        userSkillRepository.delete(userSkill);

        // Decrement the skill's users count
        if (skill != null) {
            skillService.decrementUsers(skill);
        }
    }

    /**
     * Update user skill
     */
    public UserSkill updateUserSkill(String userId, Long userSkillId, SkillLevel level, String experience) {
        UserSkill userSkill = userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("User skill not found"));

        // Verify the skill belongs to the user
        if (!userSkill.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cannot update skill that doesn't belong to the user");
        }

        if (level != null) {
            userSkill.setLevel(level);
        }

        if (experience != null) {
            userSkill.setExperience(experience);
        }

        return userSkillRepository.save(userSkill);
    }

    /**
     * Find user skill by ID
     */
    public UserSkill findById(Long userSkillId) {
        return userSkillRepository.findById(userSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("User skill not found"));
    }

    /**
     * Check if user has skill
     */
    public boolean userHasSkill(String userId, String skillName) {
        return userSkillRepository.existsByUserIdAndSkillNameIgnoreCase(userId, skillName);
    }

    /**
     * Get user skill count
     */
    public long getUserSkillCount(String userId) {
        return userSkillRepository.countByUserId(userId);
    }
}
