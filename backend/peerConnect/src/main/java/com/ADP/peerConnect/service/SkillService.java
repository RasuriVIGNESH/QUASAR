package com.ADP.peerConnect.service;
import com.ADP.peerConnect.exception.*;

import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Skill entity operations
 */
@Service
@Transactional
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    /**
     * Create a new skill
    */
    public Skill createSkill(String name, String category) {
        String normalized = normalizeSkillName(name);

        if (skillRepository.existsByNormalizedName(normalized)) {
            throw new DuplicateSkillException();
        }

        String trimmedCategory = category != null ? category.trim() : null;
        Skill skill = new Skill(name.trim(), trimmedCategory);

        return skillRepository.save(skill);
    }


    public Skill findOrCreateSkill(String name) {
        return findOrCreateSkill(name, null);
    }


    public Skill findOrCreateSkill(String name, String category) {
        String normalized = normalizeSkillName(name);

        Optional<Skill> existingSkill = skillRepository.findByNormalizedName(normalized);

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

        String resolvedCategory = (category != null && !category.trim().isEmpty())
                ? category.trim()
                : "General";
        Skill skill = new Skill(name.trim(), resolvedCategory);

        try {
            return skillRepository.save(skill);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return skillRepository.findByNormalizedName(normalized)
                    .orElseThrow(() -> e);
        }
    }

    public Skill findById(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
    }

    public List<Skill> findByName(String name) {

        Optional<Skill> skills = skillRepository.findByNameIgnoreCase(name);
        return skills.map(List::of).orElseGet(List::of);
    }

    public Page<Skill> findAll(Pageable pageable) {
        return skillRepository.findAll(pageable);
    }

    public Page<Skill> searchByName(String name, Pageable pageable) {
        return skillRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    public Page<Skill> findByCategory(String category, Pageable pageable) {
        return skillRepository.findByCategoryIgnoreCase(category, pageable);
    }


    public List<String> getAllCategories() {
        return skillRepository.findAllCategories();
    }


    public Page<Skill> getPopularSkills(Pageable pageable) {
        return skillRepository.findPopularSkills(pageable);
    }

    public Skill incrementUsers(Skill skill) {
        if (skill == null)
            throw new BadRequestException("Skill is required.");
        skill.setUsersCount(skill.getUsersCount() + 1);
        return skillRepository.save(skill);
    }

    public Skill decrementUsers(Skill skill) {
        if (skill == null)
            throw new BadRequestException("Skill is required.");
        if (skill.getUsersCount() <= 0) {
            throw new ConflictException("Skill usage count cannot be negative.");
        }
        skill.setUsersCount(skill.getUsersCount() - 1);
        return skillRepository.save(skill);
    }
    public Skill updateSkill(Long id, String name, String category) {
        Skill skill = findById(id);

        // Check if new name conflicts with existing skill (excluding current skill)
        if (name != null && !name.isBlank() && !name.equalsIgnoreCase(skill.getName())) {
            String normalized = normalizeSkillName(name);
            Optional<Skill> conflict = skillRepository.findByNormalizedName(normalized);
            if (conflict.isPresent() && !conflict.get().getId().equals(id)) {
                throw new DuplicateSkillException();
            }
            skill.setName(name.trim());
            skill.setNormalizedName(normalized);
        }

        if (category != null) {
            skill.setCategory(category.trim());
        }

        return skillRepository.save(skill);
    }

    private String normalizeSkillName(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Skill name is required.");
        }
        String normalized = Skill.normalizeName(name);
        if (normalized.length() < 2 || normalized.length() > 100) {
            throw new BadRequestException("Skill name must be between 2 and 100 characters.");
        }
        return normalized;
    }

    public void deleteSkill(Long id) {
        Skill skill = findById(id);
        skillRepository.delete(skill);
    }

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
}
