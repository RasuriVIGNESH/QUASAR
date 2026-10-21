package com.ADP.peerConnect.service;
import com.ADP.peerConnect.exception.*;

import com.ADP.peerConnect.model.dto.request.Project.CreateProject;
import com.ADP.peerConnect.model.dto.request.Project.UpdateProject;
import com.ADP.peerConnect.model.dto.request.Project.ProjectSkill;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.repository.*;
import jakarta.persistence.criteria.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserService userService;
    @Autowired private ProjectCategoryService projectCategoryService;
    @Autowired private SkillService skillService;
    @Autowired private ProjectSkillRepository projectSkillRepository;
    @Autowired private ProjectRoleService projectRoleService;
    @Autowired private CollaborationRequestLifecycleService requestLifecycleService;
    @Autowired private TeamRepo teamRepo;
    @Autowired private EventRepository eventRepo;
    @PersistenceContext private EntityManager entityManager;


    // ── Create ────────────────────────────────────────────────────────────────

    public Project createProject(CreateProject request, String leadId) {
        if (request.getSkills() == null || request.getSkills().isEmpty()) {
            throw new ProjectRequiresSkillsException();
        }
        Event event = null;
        if (request.getEventId() != null) {
            event = eventRepo.findById(request.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Event not found with id: " + request.getEventId()));
        }

        ProjectCategory category = projectCategoryService.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Project category not found with id: " + request.getCategoryId()));

        Project project = new Project(request, category, event);
        applySkillsToProject(project, request.getSkills());
        projectRoleService.createRoles(project, request.getRequiredRoles());
        projectRoleService.validateTeamCapacity(project);

        Project saved = projectRepository.save(project);

        User lead = userService.findById(leadId);
        Team team = new Team();
        team.setProject(saved);
        team.setLead(lead);
        saved.setTeam(team);
        saved.setCurrentTeamSize(1);
        return projectRepository.save(saved);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public Project updateProject(String projectId, UpdateProject request, String currentUserId) {
        Project project = findById(projectId);

        if (!teamRepo.isLead(projectId, currentUserId)) {
            throw new ForbiddenException("Only the project lead can update this project.");
        }

        if (request.getTitle() != null)       project.setTitle(request.getTitle());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getMaxTeamSize() != null) {
            if (request.getMaxTeamSize() < project.getCurrentTeamSize()) {
                throw new TeamCapacityReductionException();
            }
            project.setMaxTeamSize(request.getMaxTeamSize());
        }
        if (request.getStatus() == ProjectStatus.DELETED) {
            throw new ProjectDeletionEndpointRequiredException();
        }
        if (request.getStatus() != null)      project.setStatus(request.getStatus());

        project.setExpectedStartDate(request.getExpectedStartDate());
        project.setExpectedEndDate(request.getExpectedEndDate());
        project.setGoals(request.getGoals());
        project.setProblemStatement(request.getProblemStatement());
        project.setObjectives(request.getObjectives());
        project.setTechStackFromList(request.getTechStack());
        project.setGithubRepo(request.getGithubRepo());
        project.setDemoUrl(request.getDemoUrl());

        if (request.getCategoryId() != null || request.getCategoryName() != null) {
            resolveCategory(project, request.getCategoryId(), request.getCategoryName());
        }
        if (request.getSkills() != null) {
            applySkillsToProject(project, request.getSkills());
        }
        projectRoleService.synchronizeRoles(project, request.getRequiredRoles());
        projectRoleService.validateTeamCapacity(project);

        return projectRepository.save(project);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    public void deleteProject(String projectId, String currentUserId) {
        Project project = lockForMembershipUpdate(projectId);
        if (!teamRepo.isLead(projectId, currentUserId)) {
            throw new ForbiddenException("Only the project lead can delete this project.");
        }
        project.setStatus(ProjectStatus.DELETED);
        requestLifecycleService.expireOtherRequestsForProject(projectId, null, currentUserId);
        projectRepository.save(project);
    }

    public void markRoleFilled(String projectId, Long roleId, String currentUserId) {
        Project project = lockForMembershipUpdate(projectId);
        if (!teamRepo.isLead(projectId, currentUserId)) {
            throw new ForbiddenException("Only the project lead can mark a role filled.");
        }
        if (project.getStatus() != ProjectStatus.RECRUITING) {
            throw new ProjectNotRecruitingException();
        }
        projectRoleService.markExternallyFilled(projectId, roleId);
        if (projectRoleService.hasRequiredRoles(projectId)
                && !projectRoleService.hasOpenRoles(projectId)) {
            project.setStatus(ProjectStatus.IN_PROGRESS);
            requestLifecycleService.expireOtherRequestsForProject(projectId, null, currentUserId);
        }
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Project findById(String projectId) {
        Project project = projectRepository.findByIdWithAssociations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (project.getStatus() == ProjectStatus.DELETED) {
            throw new ProjectDeletedException(projectId);
        }
        return project;
    }

    /** Serializes membership acceptance per project to prevent capacity races. */
    public Project lockForMembershipUpdate(String projectId) {
        Project project = projectRepository.findByIdForMembershipUpdate(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        entityManager.refresh(project);
        if (project.getStatus() == ProjectStatus.DELETED) {
            throw new ProjectDeletedException(projectId);
        }
        return project;
    }

    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> getRecentProjects(
            Pageable pageable
    ) {
        Page<String> idPage =
                projectRepository.findRecentProjectIds(pageable);

        if (idPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Project> projects =
                projectRepository.findByIdsWithCardAssociations(
                        idPage.getContent()
                );

        Map<String, Project> projectMap =
                projects.stream()
                        .collect(Collectors.toMap(
                                Project::getId,
                                Function.identity(),
                                (first, second) -> first
                        ));

        List<ProjectCardResponse> responses =
                idPage.getContent()
                        .stream()
                        .map(projectMap::get)
                        .filter(Objects::nonNull)
                        .map(ProjectCardResponse::new)
                        .collect(Collectors.toList());

        return new PageImpl<>(
                responses,
                pageable,
                idPage.getTotalElements()
        );
    }



    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> findProjectsByUser(String userId, Pageable pageable) {
        Page<Project> page = projectRepository.findProjectsByLeadOrMember(userId, pageable);
        hydrateSkills(page.getContent());
        return page.map(this::toCardResponseWithImages);
    }

    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> discoverProjects(String currentUserId, Pageable pageable) {
        Page<Project> page = projectRepository.findDiscoverProjectsForUser(
                currentUserId, ProjectStatus.RECRUITING, pageable);
        hydrateSkills(page.getContent());
        return page.map(this::toCardResponseWithImages);
    }

    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> findProjectsInCollege(String collegeId, Pageable pageable) {
        try {
            Long cId = Long.parseLong(collegeId);
            Page<Project> page = projectRepository.findByLeadCollegeId(cId, pageable);
            hydrateSkills(page.getContent());
            return page.map(this::toCardResponseWithImages);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Invalid College ID format. Must be a number.");
        }
    }

    @Transactional(readOnly = true)
    public Page<ProjectCardResponse> searchProjects(String query, String category,
                                                    ProjectStatus status, List<String> skills,
                                                    boolean availableOnly, Pageable pageable,
                                                    String currentUserId) {
        Specification<Project> spec = buildSearchSpec(
                query, category, status, skills, availableOnly, currentUserId);

        Page<Project> page = projectRepository.findAll(spec, pageable);
        hydrateSkills(page.getContent());
        return page.map(this::toCardResponseWithImages);
    }

    public int countAllProjects() {
        return (int) projectRepository.count();
    }

    // ── Member / lead checks (delegates to TeamRepo) ──────────────────────────

    @Transactional(readOnly = true)
    public boolean isProjectLead(String projectId, String userId) {
        return teamRepo.isLead(projectId, userId);
    }

    @Transactional(readOnly = true)
    public boolean isProjectMember(String projectId, String userId) {
        return teamRepo.isInTeam(projectId, userId);
    }

    @Transactional(readOnly = true)
    public int getCurrentTeamSize(String projectId) {
        return teamRepo.countByProjectId(projectId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void resolveCategory(Project project, Long categoryId, String categoryName) {
        if (categoryId != null && categoryId != 0) {
            ProjectCategory category = projectCategoryService.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Project category not found with id: " + categoryId));
            project.setCategory(category);
        } else if (categoryName != null && !categoryName.isBlank()) {
            ProjectCategory cat = projectCategoryService.findByName(categoryName)
                    .orElseGet(() -> projectCategoryService.create(categoryName));
            project.setCategory(cat);
        } else {
            project.setCategory(null);
        }
    }

    private void applySkillsToProject(Project project, List<ProjectSkill> skillRequests) {
        project.getProjectSkills().clear();
        Set<String> normalizedNames = new HashSet<>();

        for (ProjectSkill req : skillRequests) {
            if (req == null || req.getSkillName() == null || req.getSkillName().isBlank()) {
                throw new ProjectSkillRequiredException();
            }
            String normalizedName = Skill.normalizeName(req.getSkillName());
            if (!normalizedNames.add(normalizedName)) {
                throw new DuplicateProjectSkillException(req.getSkillName().trim());
            }
            Skill skill = skillService.findOrCreateSkill(req.getSkillName());

            com.ADP.peerConnect.model.entity.ProjectSkill ps = new com.ADP.peerConnect.model.entity.ProjectSkill();
            ps.setProject(project);
            ps.setSkill(skill);
            ps.setRequiredLevel(req.getLevel());
            project.getProjectSkills().add(ps);
        }
    }

    private void hydrateSkills(List<Project> projects) {
        if (projects == null || projects.isEmpty()) return;

        List<String> ids = projects.stream().map(Project::getId).toList();
        List<com.ADP.peerConnect.model.entity.ProjectSkill> allSkills = projectSkillRepository.findSkillsByProjectIds(ids);

        Map<String, List<com.ADP.peerConnect.model.entity.ProjectSkill>> grouped = allSkills.stream()
                .collect(Collectors.groupingBy(ps -> ps.getProject().getId()));

        projects.forEach(p -> p.setProjectSkills(
                grouped.getOrDefault(p.getId(), new ArrayList<>())));
    }

    private ProjectCardResponse toCardResponseWithImages(
            Project project
    ) {
        ProjectCardResponse card =
                new ProjectCardResponse(project);

        card.setMemberProfileImageUrls(
                teamRepo.getMemberProfileImageUrls(project.getId())
        );

        return card;
    }


    private Specification<Project> buildSearchSpec(String query, String category,
                                                   ProjectStatus status, List<String> skills,
                                                   boolean availableOnly, String currentUserId) {
        return (root, q, cb) -> {
            boolean isCountQuery = q.getResultType() == Long.class || q.getResultType() == long.class;

            Join<Project, Team> teamJoin;
            Join<Project, ?> categoryJoin;

            if (!isCountQuery) {
                // Fetch join only for the actual content query (avoids N+1)
                Fetch<Project, Team> teamFetch = root.fetch("team", JoinType.INNER);
                teamFetch.fetch("lead", JoinType.INNER);
                teamJoin = (Join<Project, Team>) teamFetch;

                Fetch<Project, ?> categoryFetch = root.fetch("category", JoinType.LEFT);
                categoryJoin = (Join<Project, ?>) categoryFetch;

                q.distinct(true);
            } else {
                // Plain joins for the COUNT query — no fetching allowed here
                teamJoin = root.join("team", JoinType.INNER);
                categoryJoin = root.join("category", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (category != null && !category.isBlank()) {
                predicates.add(cb.equal(cb.lower(categoryJoin.get("name")), category.toLowerCase()));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (availableOnly) {
                predicates.add(cb.and(
                        cb.equal(root.get("status"), ProjectStatus.RECRUITING),
                        cb.lt(root.get("currentTeamSize"), root.get("maxTeamSize"))
                ));
            }

            if (skills != null && !skills.isEmpty()) {
                Join<?, ?> psJoin = root.join("projectSkills", JoinType.INNER);
                Join<?, ?> skillJoin = psJoin.join("skill", JoinType.INNER);
                predicates.add(skillJoin.get("name").in(skills));
            }

            if (currentUserId != null && !currentUserId.isBlank()) {
                predicates.add(cb.notEqual(teamJoin.get("lead").get("id"), currentUserId));

                Subquery<String> sub = q.subquery(String.class);
                Root<Team> subTeam = sub.from(Team.class);
                Join<?, ?> subMembers = subTeam.join("members");
                sub.select(subTeam.get("project").get("id"))
                        .where(
                                cb.equal(subTeam.get("project").get("id"), root.get("id")),
                                cb.equal(subMembers.get("id"), currentUserId)
                        );
                predicates.add(cb.not(cb.exists(sub)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public List<ProjectCardResponse> getAllProjectsInEvent(Long eventId) {
        List<Project>projects=projectRepository.findByEventId(eventId);
        return projects.stream()
                .map(this::toCardResponseWithImages)
                .collect(Collectors.toList());
    }
}
