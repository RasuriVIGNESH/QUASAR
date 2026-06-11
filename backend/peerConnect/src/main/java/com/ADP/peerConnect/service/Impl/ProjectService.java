package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.UnauthorizedException;
import com.ADP.peerConnect.model.dto.request.Project.CreateProjectRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateProjectRequest;
import com.ADP.peerConnect.model.dto.request.Project.ProjectSkillRequest;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.ProjectRole;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.repository.ProjectMemberRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.repository.SkillRepository;
import com.ADP.peerConnect.repository.ProjectSkillRepository;
import com.ADP.peerConnect.repository.EventRepository;
import com.ADP.peerConnect.service.Interface.iProjectService;
import jakarta.persistence.criteria.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService implements iProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectCategoryService projectCategoryService;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProjectSkillRepository projectSkillRepository;

    @Autowired
    private SkillService skillService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private CollegeService collegeService;

    @Autowired
    private UserRepository userRepository;

    // Create a new project
    public Project createProject(CreateProjectRequest request, String LeadId) {
        if (request.getSkills() == null || request.getSkills().isEmpty()) {
            throw new BadRequestException("Project must have at least one skill");
        }
        User Lead = userService.findById(LeadId);
        Project project = new Project(
                request.getTitle(),
                request.getDescription(),
                null,
                request.getMaxTeamSize(),
                Lead);
        project.setExpectedStartDate(request.getExpectedStartDate());
        project.setExpectedEndDate(request.getExpectedEndDate());
        project.setGoals(request.getGoals());
        project.setProblemStatement(request.getProblemStatement());
        project.setObjectives(request.getObjectives());
        project.setTechStackFromList(request.getTechStack());
        project.setGithubRepo(request.getGithubRepo());
        project.setDemoUrl(request.getDemoUrl());

        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            project.setEvent(event);
        }

        applySkillsToProject(project, request.getSkills());

        if (request.getCategoryId() != null && request.getCategoryId() != 0) {
            projectCategoryService.findById(request.getCategoryId()).ifPresent(project::setCategory);
        } else if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            ProjectCategory cat = projectCategoryService.findByName(request.getCategoryName())
                    .orElseGet(() -> projectCategoryService.create(new ProjectCategory(request.getCategoryName())));
            project.setCategory(cat);
        }

        return projectRepository.save(project);
    }

    // Update an existing project
    public Project updateProject(String projectId, UpdateProjectRequest request, String currentUserId) {
        Project project = findById(projectId);
        if (!project.isLead(currentUserId)) {
            throw new UnauthorizedException("Only project Lead can update");
        }
        if (request.getTitle() != null)
            project.setTitle(request.getTitle());
        if (request.getDescription() != null)
            project.setDescription(request.getDescription());
        if (request.getMaxTeamSize() != null)
            project.setMaxTeamSize(request.getMaxTeamSize());
        if (request.getStatus() != null)
            project.setStatus(request.getStatus());
        project.setExpectedStartDate(request.getExpectedStartDate());
        project.setExpectedEndDate(request.getExpectedEndDate());
        project.setGoals(request.getGoals());
        project.setProblemStatement(request.getProblemStatement());
        project.setObjectives(request.getObjectives());
        project.setTechStackFromList(request.getTechStack());
        project.setGithubRepo(request.getGithubRepo());
        project.setDemoUrl(request.getDemoUrl());

        if (request.getCategoryId() != null) {
            if (request.getCategoryId() != 0) {
                projectCategoryService.findById(request.getCategoryId()).ifPresent(project::setCategory);
            } else {
                project.setCategory(null);
            }
        } else if (request.getCategoryName() != null) {
            if (!request.getCategoryName().isBlank()) {
                ProjectCategory pc = projectCategoryService.findByName(request.getCategoryName())
                        .orElseGet(() -> projectCategoryService.create(new ProjectCategory(request.getCategoryName())));
                project.setCategory(pc);
            } else {
                project.setCategory(null);
            }
        }
        if (request.getSkills() != null) {
            applySkillsToProject(project, request.getSkills());
        }

        return projectRepository.save(project);
    }

    // Delete a project
    public void deleteProject(String projectId, String currentUserId) {
        Project project = findById(projectId);
        if (!project.isLead(currentUserId)) {
            throw new UnauthorizedException("Only project Lead can delete");
        }
        projectRepository.delete(project);
    }

    // Get project by ID
    @Transactional(readOnly = true)
    public Project findById(String projectId) {
        return projectRepository.findByIdWithAssociations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getRecentProjects(Pageable pageable) {
        Page<Project> projects = projectRepository.findAllWithCategory(pageable);
        return projects.map(ProjectResponse::new);
    }

    public Page<Project> findByLead(String LeadId, Pageable pageable) {
        return projectRepository.findByLeadIdOrderByCreatedAtDesc(LeadId, pageable);
    }

    public Page<Project> findProjectsByMember(String userId, Pageable pageable) {
        return projectRepository.findByMemberId(userId, pageable);
    }

    public Page<Project> findProjectsWithAvailableSpots(Pageable pageable) {
        return projectRepository.findProjectsWithAvailableSpots(pageable);
    }

    /**
     * FIX: Return Page<ProjectCardResponse> so DTO mapping happens inside
     * the @Transactional boundary — eliminates LazyInitializationException
     * on projectSkills/skill.name.
     * The Specification already fetches lead & category eagerly via root.fetch().
     * projectSkills are loaded via Hibernate.initialize() before mapping.
     */
    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> searchProjects(
            String query,
            String category,
            ProjectStatus status,
            List<String> skills,
            boolean availableOnly,
            Pageable pageable,
            String currentUserId) {

        Specification<Project> spec = (root, q, cb) -> {

            root.fetch("lead", JoinType.INNER);
            root.fetch("category", JoinType.LEFT);


            q.distinct(true);

            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")),
                                "%" + query.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("description")),
                                "%" + query.toLowerCase() + "%")
                ));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(
                        cb.equal(
                                cb.lower(root.join("category", JoinType.LEFT).get("name")),
                                category.toLowerCase()
                        )
                );
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (availableOnly) {
                predicates.add(
                        cb.and(
                                cb.equal(root.get("status"), ProjectStatus.RECRUITING),
                                cb.lt(
                                        cb.size(root.get("projectMembers")),
                                        root.get("maxTeamSize")
                                )
                        )
                );
            }

            if (skills != null && !skills.isEmpty()) {
                // Use a separate join (not the fetch join) for filtering
                Join<Object, Object> projectSkillsJoin = root.join("projectSkills", JoinType.LEFT);
                Join<Object, Object> skillJoin = projectSkillsJoin.join("skill", JoinType.LEFT);
                predicates.add(skillJoin.get("name").in(skills));
            }

            if (currentUserId != null && !currentUserId.isBlank()) {
                Predicate notLead = cb.not(cb.equal(root.get("lead").get("id"), currentUserId));

                Subquery<String> sub = q.subquery(String.class);
                Root<Project> subRoot = sub.from(Project.class);
                Join<?, ?> subMembers = subRoot.join("projectMembers");
                sub.select(subRoot.get("id"))
                        .where(
                                cb.equal(subRoot.get("id"), root.get("id")),
                                cb.equal(subMembers.get("user").get("id"), currentUserId)
                        );

                predicates.add(cb.and(notLead, cb.not(cb.exists(sub))));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<Project> page =
                projectRepository.findAll(spec, pageable);

        hydrateSkills(page.getContent());

        return page.map(ProjectCardResponse::new);
    }

    /**
     * FIX: Return Page<ProjectCardResponse> so mapping happens inside the
     * transaction.  The updated findByLeadCollegeId query in ProjectRepository
     * now JOIN FETCHes lead, category, projectSkills and skill.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> findProjetsInCollege(String collegeId, Pageable pageable) {
        try {
            Long cId = Long.parseLong(collegeId);
            Page<Project> page =
                    projectRepository.findByLeadCollegeId(cId, pageable);

            hydrateSkills(page.getContent());

            return page.map(ProjectCardResponse::new);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid College ID format. Must be a number.");
        }
    }

    @Override
    public boolean isUserMemberOrLead(String projectId, String userId) {
        Project project = findById(projectId);
        if (project.getLead().getId().equals(userId)) {
            return true;
        }
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    public boolean isProjectLead(String projectId, String userId) {
        Project project = findById(projectId);
        return project.getLead().getId().equals(userId);
    }

    public boolean isProjectMember(String projectId, String userId) {
        if (isProjectLead(projectId, userId)) {
            return true;
        }
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    public ProjectMember addMember(String projectId, String userId, ProjectRole role, String currentUserId) {
        Project project = findById(projectId);
        if (!project.isLead(currentUserId)) {
            throw new UnauthorizedException("Only project Lead can add members");
        }
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ConflictException("User is already a member");
        }
        User user = userService.findById(userId);
        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRole(role);
        return projectMemberRepository.save(member);
    }

    public void removeMember(String projectId, Long memberId, String currentUserId) {
        Project project = findById(projectId);
        if (!project.isLead(currentUserId)) {
            throw new UnauthorizedException("Only project Lead can remove members");
        }
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        if (!member.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Member does not belong to project");
        }
        projectMemberRepository.delete(member);
    }

    public ProjectMember updateMemberRole(String projectId, Long memberId, ProjectRole newRole, String currentUserId) {
        Project project = findById(projectId);
        if (!project.isLead(currentUserId)) {
            throw new UnauthorizedException("Only project Lead can update roles");
        }
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        if (!member.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Member does not belong to project");
        }
        member.setRole(newRole);
        return projectMemberRepository.save(member);
    }

    public void leaveProject(String projectId, String currentUserId) {
        projectMemberRepository.findByProjectIdAndUserIdWithUser(projectId, currentUserId)
                .ifPresentOrElse(
                        projectMemberRepository::delete,
                        () -> {
                            throw new BadRequestException("Not a project member");
                        });
    }

    public List<ProjectMember> getProjectMembers(String projectId) {
        return projectMemberRepository.findByProjectIdWithUser(projectId);
    }

    /**
     * FIX: Return Page<ProjectCardResponse>; the updated
     * findDiscoverProjectsForUser query now JOIN FETCHes projectSkills+skill.
     */
    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> discoverProjects(String currentUserId, Pageable pageable) {
        Page<Project> page =
                projectRepository.findDiscoverProjectsForUser(
                        currentUserId,
                        ProjectStatus.RECRUITING,
                        pageable
                );


        hydrateSkills(page.getContent());

        return page.map(ProjectCardResponse::new);
    }

    /**
     * FIX: Return Page<ProjectResponse>; the updated findProjectsByLeadOrMember
     * query now JOIN FETCHes projectSkills+skill so ProjectResponse (which accesses
     * lead and category) is also safe.
     */
    @Transactional(readOnly = true)
    public Page<ProjectResponse> findProjectsByUser(String userId, Pageable pageable) {
        Page<Project> page =
                projectRepository.findProjectsByLeadOrMember(
                        userId,
                        pageable
                );

        hydrateSkills(page.getContent());

        return page.map(ProjectResponse::new);
    }

    public long countProjectsForUser(String userId) {
        return projectRepository.countProjectsByLeadOrMember(userId);
    }

    public Long getCurrentTeamSize(String projectId) {
        return projectMemberRepository.countByProjectId(projectId);
    }

    @Override
    public int countAllProjects() {
        return (int) projectRepository.count();
    }
    private void hydrateSkills(List<Project> projects) {

        if (projects == null || projects.isEmpty()) {
            return;
        }

        List<String> projectIds = projects.stream()
                .map(Project::getId)
                .toList();

        List<ProjectSkill> projectSkills =
                projectSkillRepository.findSkillsByProjectIds(projectIds);

        Map<String, List<ProjectSkill>> grouped =
                projectSkills.stream()
                        .collect(Collectors.groupingBy(
                                ps -> ps.getProject().getId()
                        ));

        projects.forEach(project ->
                project.setProjectSkills(
                        grouped.getOrDefault(
                                project.getId(),
                                new ArrayList<>()
                        )
                ));
    }

    private void applySkillsToProject(Project project, List<ProjectSkillRequest> skillRequests) {
        if (skillRequests == null) return;

        Map<String, ProjectSkillRequest> dedup = skillRequests.stream()
                .collect(Collectors.toMap(
                        r -> (r.getSkillId() != null)
                                ? String.valueOf(r.getSkillId())
                                : r.getSkillName().toLowerCase(),
                        r -> r,
                        (a, b) -> a
                ));

        List<ProjectSkill> existingList =
                project.getId() != null
                        ? projectSkillRepository.findByProjectIdWithSkill(project.getId())
                        : new ArrayList<>();

        Map<Long, ProjectSkill> existingMap = existingList.stream()
                .filter(ps -> ps.getSkill() != null && ps.getSkill().getId() != null)
                .collect(Collectors.toMap(ps -> ps.getSkill().getId(), ps -> ps));

        List<Long> skillIds = dedup.values().stream()
                .map(ProjectSkillRequest::getSkillId)
                .filter(id -> id != null)
                .toList();

        List<String> skillNames = dedup.values().stream()
                .filter(r -> r.getSkillId() == null)
                .map(r -> r.getSkillName().trim().toLowerCase())
                .toList();

        Map<Long, Skill> skillMap = skillRepository.findAllById(skillIds)
                .stream()
                .collect(Collectors.toMap(Skill::getId, s -> s));

        Map<String, Skill> skillNameMap = skillRepository.findByNameIn(skillNames)
                .stream()
                .collect(Collectors.toMap(s -> s.getName().toLowerCase(), s -> s));

        List<ProjectSkill> newProjectSkills = new ArrayList<>();

        for (ProjectSkillRequest req : dedup.values()) {
            Skill skill;

            if (req.getSkillId() != null) {
                skill = skillMap.get(req.getSkillId());
            } else {
                String name = req.getSkillName().trim().toLowerCase();
                skill = skillNameMap.get(name);
                if (skill == null) {
                    skill = new Skill();
                    skill.setName(name);
                    skill = skillRepository.save(skill);
                }
            }

            boolean requiredFlag = (req.getRequired() == null) || req.getRequired();

            ProjectSkill ps = existingMap.get(skill.getId());
            if (ps == null) {
                ps = new ProjectSkill(project, skill, requiredFlag);
            } else {
                ps.setIsRequired(requiredFlag);
            }

            newProjectSkills.add(ps);
        }

        project.getProjectSkills().clear();
        project.getProjectSkills().addAll(newProjectSkills);
    }
}