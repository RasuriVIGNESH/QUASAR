package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface iSkillService {
    public Skill createSkill(String name, String category) ;
    public Skill findOrCreateSkill(String name);
    public Skill findById(Long id) ;
    public Page<Skill> findAll(Pageable pageable);
    public List<Skill> getPredefinedSkills() ;
    public Page<Skill> searchByName(String name, Pageable pageable);
    public Page<Skill> findByCategory(String category, Pageable pageable);
    public List<String> getAllCategories() ;
    public Page<Skill> getPopularSkills(Pageable pageable) ;
    public Skill incrementUsers(Skill skill) ;
    public Skill decrementUsers(Skill skill);
    public Skill updateSkill(Long id, String name, String category) ;
    public void deleteSkill(Long id) ;
    public boolean existsByName(String name);
    public List<Skill> findByName(String name);
    public Optional<Skill> findByNormalizedName(String normalizedName);

    public boolean existsByNormalizedName(String normalizedName);

    // advanced search
    public List<Skill> searchSkills(String search, Pageable pageable);

    // top skills
    public List<Skill> getTopSkillsByUsers(Pageable pageable) ;

    public List<Skill> getTopSkillsByProjects(Pageable pageable);

    // predefined ordered by usage
    public List<Skill> getPredefinedSkillsByUsage(Pageable pageable);

    // category ordered by usage
    public List<Skill> getSkillsByCategoryOrdered(String category);
    // exact usage match
    public List<Skill> findByUsersAndProjectsCount(Integer users,
                                                   Integer projects);

    // trending
    public List<Skill> getTrendingSkills(Pageable pageable);

    // recommendations
    public List<Skill> getRecommendedSkillsForUser(List<Long> skillIds,
                                                   Pageable pageable) ;

    public List<Skill> getComplementarySkillsForProject(List<Long> skillIds,
                                                        Pageable pageable);



    // popular by category + threshold
    public List<Skill> getPopularSkillsByCategory(String category,
                                                  Integer minUsers);

    public List<Skill> findByNamesIgnoreCase(List<String> names) ;
}
