package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.repository.SkillRepository;
import com.ADP.peerConnect.service.Interface.iSkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service class for Skill entity operations
 */
@Service
@Transactional
public class SkillService implements iSkillService {

    @Autowired
    private SkillRepository skillRepository;

    /**
     * Create a new skill
     */
    public Skill createSkill(String name, String category) {
        // Check if skill already exists
        if (skillRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Skill with this name already exists");
        }

        Skill skill = new Skill();
        skill.setName(name.trim());
        skill.setCategory(category != null ? category.trim() : null);
        skill.setIsPredefined(false); // User-created skills are not predefined

        return skillRepository.save(skill);
    }

    /**
     * Find or create skill by name
     */
    /**
     * Find or create skill by name
     */
    public Skill findOrCreateSkill(String name) {
        return findOrCreateSkill(name, null);
    }

    /**
     * Find or create skill by name with category
     */
    public Skill findOrCreateSkill(String name, String category) {
        Optional<Skill> existingSkill = skillRepository.findByNameIgnoreCase(name);

        if (existingSkill.isPresent()) {
            Skill skill = existingSkill.get();
            // Update category if existing is null/empty/General and new one is valid
            if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("General")) {
                String currentCat = skill.getCategory();
                if (currentCat == null || currentCat.trim().isEmpty() || currentCat.equalsIgnoreCase("General")) {
                    skill.setCategory(category.trim());
                    return skillRepository.save(skill);
                }
            }
            return skill;
        }

        // Create new skill if it doesn't exist
        Skill skill = new Skill();
        skill.setName(name.trim());
        skill.setCategory((category != null && !category.trim().isEmpty()) ? category.trim() : "General");
        skill.setIsPredefined(false);

        return skillRepository.save(skill);
    }

    /**
     * Find skill by ID
     */
    public Skill findById(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
    }

    /**
     * Find skill by name (case insensitive)
     */
    public List<Skill> findByName(String name) {

        Optional<Skill> skills = skillRepository.findByNameIgnoreCase(name);
        if (skills.isPresent()) {
            return List.of(skills.get());
        }
        return null;
    }

    /**
     * Get all skills with pagination
     */
    public Page<Skill> findAll(Pageable pageable) {
        return skillRepository.findAll(pageable);
    }

    /**
     * Get predefined skills
     */
    public List<Skill> getPredefinedSkills() {
        return skillRepository.findByIsPredefinedTrueOrderByNameAsc();
    }

    /**
     * Search skills by name
     */
    public Page<Skill> searchByName(String name, Pageable pageable) {
        return skillRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    /**
     * Find skills by category
     */
    public Page<Skill> findByCategory(String category, Pageable pageable) {
        return skillRepository.findByCategoryIgnoreCase(category, pageable);
    }

    /**
     * Get all categories
     */
    public List<String> getAllCategories() {
        return skillRepository.findAllCategories();
    }

    /**
     * Get popular skills
     */
    public Page<Skill> getPopularSkills(Pageable pageable) {
        return skillRepository.findPopularSkills(pageable);
    }

    /**
     * Increment the users count for a skill (safely handles nulls)
     */
    public Skill incrementUsers(Skill skill) {
        if (skill == null)
            throw new IllegalArgumentException("Skill cannot be null");
        Integer current = skill.getUsersCount() == null ? 0 : skill.getUsersCount();
        skill.setUsersCount(current + 1);
        return skillRepository.save(skill);
    }

    /**
     * Decrement the users count for a skill (never goes below 0)
     */
    public Skill decrementUsers(Skill skill) {
        if (skill == null)
            throw new IllegalArgumentException("Skill cannot be null");
        Integer current = skill.getUsersCount() == null ? 0 : skill.getUsersCount();
        skill.setUsersCount(current - 1);

        return skillRepository.save(skill);
    }

    /**
     * Update skill
     */
    public Skill updateSkill(Long id, String name, String category) {
        Skill skill = findById(id);

        // Check if new name conflicts with existing skill (excluding current skill)
        if (name != null && !name.equalsIgnoreCase(skill.getName())) {
            if (skillRepository.existsByNameIgnoreCase(name)) {
                throw new ConflictException("Skill with this name already exists");
            }
            skill.setName(name.trim());
        }

        if (category != null) {
            skill.setCategory(category.trim());
        }

        return skillRepository.save(skill);
    }

    /**
     * Delete skill
     */
    public void deleteSkill(Long id) {
        Skill skill = findById(id);

        // Don't allow deletion of predefined skills
        if (skill.getIsPredefined()) {
            throw new ConflictException("Cannot delete predefined skills");
        }

        skillRepository.delete(skill);
    }

    /**
     * Check if skill exists by name
     */
    public boolean existsByName(String name) {
        return skillRepository.existsByNameIgnoreCase(name);
    }

    // find by normalized name
    public Optional<Skill> findByNormalizedName(String normalizedName) {
        return skillRepository.findByNormalizedName(normalizedName);
    }

    public boolean existsByNormalizedName(String normalizedName) {
        return skillRepository.existsByNormalizedName(normalizedName);
    }

    // advanced search
    public List<Skill> searchSkills(String search, Pageable pageable) {
        return skillRepository.searchSkills(search, pageable);
    }

    // top skills
    public List<Skill> getTopSkillsByUsers(Pageable pageable) {
        return skillRepository.findTopByOrderByUsersCountDesc(pageable);
    }

    public List<Skill> getTopSkillsByProjects(Pageable pageable) {
        return skillRepository.findTopByOrderByProjectsCountDesc(pageable);
    }

    // predefined ordered by usage
    public List<Skill> getPredefinedSkillsByUsage(Pageable pageable) {
        return skillRepository.findByIsPredefinedTrueOrderByUsersCountDesc(pageable);
    }

    // category ordered by usage
    public List<Skill> getSkillsByCategoryOrdered(String category) {
        return skillRepository.findByCategoryOrderByUsersCountDesc(category);
    }

    // exact usage match
    public List<Skill> findByUsersAndProjectsCount(Integer users,
            Integer projects) {
        return skillRepository.findByUsersCountAndProjectsCount(users, projects);
    }

    // trending
    public List<Skill> getTrendingSkills(Pageable pageable) {
        return skillRepository.findTrendingSkills(pageable);
    }

    // recommendations
    public List<Skill> getRecommendedSkillsForUser(List<Long> skillIds,
            Pageable pageable) {
        return skillRepository.findRecommendedSkillsForUser(skillIds, pageable);
    }

    public List<Skill> getComplementarySkillsForProject(List<Long> skillIds,
            Pageable pageable) {
        return skillRepository.findComplementarySkillsForProject(skillIds, pageable);
    }

    // popular by category + threshold
    public List<Skill> getPopularSkillsByCategory(String category,
            Integer minUsers) {
        return skillRepository.findPopularSkillsByCategory(category, minUsers);
    }

    // batch name lookup
    public List<Skill> findByNamesIgnoreCase(List<String> names) {
        return skillRepository.findByNameInIgnoreCase(names);
    }

}
