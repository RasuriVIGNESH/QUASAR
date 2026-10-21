package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.exception.ProjectDeletedException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.model.dto.response.ProjectRecommendationResult;
import com.ADP.peerConnect.model.dto.response.ProjectSkillAnalysisResponse;
import com.ADP.peerConnect.model.dto.response.ProjectSkillCoverageResponse;
import com.ADP.peerConnect.model.dto.response.ProjectSkillMemberEvidenceResponse;
import com.ADP.peerConnect.model.dto.response.SkillDemandResponse;
import com.ADP.peerConnect.model.dto.response.StudentSkillAnalysisResponse;
import com.ADP.peerConnect.model.dto.response.StudentSkillInsightResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectSkill;
import com.ADP.peerConnect.model.entity.Team;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.ProjectSkillCoverageStatus;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.ProjectSkillRepository;
import com.ADP.peerConnect.repository.SkillDemandProjection;
import com.ADP.peerConnect.repository.SkillInsightsRepository;
import com.ADP.peerConnect.repository.TeamRepo;
import com.ADP.peerConnect.repository.UserSkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SkillInsightsService {
    private static final int MAX_DEMAND_PAGE_SIZE = 100;
    private static final int MISSING_SKILL_SUGGESTION_LIMIT = 10;
    private static final int PROJECT_RECOMMENDATION_LIMIT = 5;

    private final UserService userService;
    private final UserSkillRepository userSkillRepository;
    private final SkillInsightsRepository skillInsightsRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSkillRepository projectSkillRepository;
    private final TeamRepo teamRepository;
    private final RecommendationService recommendationService;
    private final RecommendationScoringService scoringService;

    public SkillInsightsService(UserService userService,
                                UserSkillRepository userSkillRepository,
                                SkillInsightsRepository skillInsightsRepository,
                                ProjectRepository projectRepository,
                                ProjectSkillRepository projectSkillRepository,
                                TeamRepo teamRepository,
                                RecommendationService recommendationService,
                                RecommendationScoringService scoringService) {
        this.userService = userService;
        this.userSkillRepository = userSkillRepository;
        this.skillInsightsRepository = skillInsightsRepository;
        this.projectRepository = projectRepository;
        this.projectSkillRepository = projectSkillRepository;
        this.teamRepository = teamRepository;
        this.recommendationService = recommendationService;
        this.scoringService = scoringService;
    }

    public StudentSkillAnalysisResponse getStudentAnalysis(String studentId) {
        User student = userService.findById(studentId);
        if (student.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Student account required for personal skill analysis.");
        }

        List<UserSkill> profileRows = userSkillRepository.findByUserIdWithSkill(studentId);
        List<Long> profileSkillIds = profileRows.stream()
                .map(row -> row.getSkill().getId())
                .distinct()
                .toList();

        Map<Long, SkillDemandResponse> demandBySkill = profileSkillIds.isEmpty()
                ? Map.of()
                : skillInsightsRepository.findActiveDemandForSkillIds(profileSkillIds).stream()
                    .map(SkillDemandResponse::new)
                    .collect(Collectors.toMap(SkillDemandResponse::getSkillId, demand -> demand));

        List<StudentSkillInsightResponse> profileSkills = profileRows.stream()
                .map(row -> {
                    SkillDemandResponse demand = demandBySkill.get(row.getSkill().getId());
                    return new StudentSkillInsightResponse(
                            row.getSkill().getId(),
                            row.getSkill().getName(),
                            row.getSkill().getCategory(),
                            row.getLevel(),
                            demand == null ? 0L : demand.getActiveProjectCount(),
                            demand == null ? 0L : demand.getRecruitingProjectCount(),
                            demand == null ? 0L : demand.getInProgressProjectCount());
                })
                .sorted(Comparator.comparing(StudentSkillInsightResponse::getSkillName,
                        String.CASE_INSENSITIVE_ORDER))
                .toList();

        int profileSkillsInDemandCount = (int) profileSkills.stream()
                .filter(skill -> skill.getActiveProjectCount() > 0)
                .count();

        List<SkillDemandResponse> missingDemand = skillInsightsRepository
                .findTopMissingDemandForStudent(studentId, PageRequest.of(0, MISSING_SKILL_SUGGESTION_LIMIT))
                .stream()
                .map(SkillDemandResponse::new)
                .toList();

        List<ProjectRecommendationResult> projectMatches = recommendationService
                .recommendProjects(studentId, PageRequest.of(0, PROJECT_RECOMMENDATION_LIMIT))
                .getContent();

        return new StudentSkillAnalysisResponse(profileSkills.size(), profileSkillsInDemandCount,
                profileSkills, missingDemand, projectMatches);
    }

    public Page<SkillDemandResponse> getDemand(String category, String search, Pageable pageable) {
        if (pageable.getPageSize() > MAX_DEMAND_PAGE_SIZE) {
            throw new BadRequestException(
                    "Demand page size must not exceed " + MAX_DEMAND_PAGE_SIZE + ".");
        }
        String categoryFilter = category == null ? "" : category.trim();
        String searchFilter = search == null ? "" : search.trim();
        return skillInsightsRepository.findActiveDemand(categoryFilter, searchFilter, pageable)
                .map(SkillDemandResponse::new);
    }

    public ProjectSkillAnalysisResponse getProjectAnalysis(String projectId, String requesterId) {
        Project project = projectRepository.findByIdWithAssociations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
        if (project.getStatus() == ProjectStatus.DELETED) {
            throw new ProjectDeletedException(projectId);
        }
        if (!Boolean.TRUE.equals(teamRepository.isInTeam(projectId, requesterId))) {
            throw new ForbiddenException("Only current project members can view team skill analysis.");
        }

        Team team = teamRepository.findTeamWithLeadAndMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found."));
        Map<String, User> teamUsers = new LinkedHashMap<>();
        if (team.getLead() != null) {
            teamUsers.put(team.getLead().getId(), team.getLead());
        }
        team.getMembers().forEach(user -> teamUsers.put(user.getId(), user));

        List<ProjectSkill> requirements = projectSkillRepository.findSkillsByProjectIds(List.of(projectId)).stream()
                .sorted(Comparator.comparing(row -> row.getSkill().getName(), String.CASE_INSENSITIVE_ORDER))
                .toList();

        List<UserSkill> memberSkillRows = teamUsers.isEmpty()
                ? List.of()
                : userSkillRepository.findAllByUserIdsWithSkill(new ArrayList<>(teamUsers.keySet()));
        Set<String> membersWithProfiles = memberSkillRows.stream()
                .map(row -> row.getUser().getId())
                .collect(Collectors.toSet());
        Map<Long, List<UserSkill>> rowsBySkillId = new HashMap<>();
        memberSkillRows.forEach(row -> rowsBySkillId
                .computeIfAbsent(row.getSkill().getId(), ignored -> new ArrayList<>())
                .add(row));

        List<ProjectSkillCoverageResponse> skillCoverage = new ArrayList<>(requirements.size());
        int covered = 0;
        int partiallyCovered = 0;
        int notListed = 0;
        int unknown = 0;
        int teamProfileCount = membersWithProfiles.size();

        for (ProjectSkill requirement : requirements) {
            List<UserSkill> listedRows = rowsBySkillId.getOrDefault(requirement.getSkill().getId(), List.of());
            List<ProjectSkillMemberEvidenceResponse> evidence = listedRows.stream()
                    .map(row -> {
                        User member = teamUsers.get(row.getUser().getId());
                        Boolean meetsLevel = requirement.getRequiredLevel() == null
                                ? null
                                : scoringService.meetsRequiredLevel(row.getLevel(), requirement.getRequiredLevel());
                        return new ProjectSkillMemberEvidenceResponse(
                                member == null ? row.getUser().getId() : member.getId(),
                                member == null ? "Project member" : displayName(member),
                                member != null && team.getLead() != null
                                        && member.getId().equals(team.getLead().getId()),
                                row.getLevel(), meetsLevel);
                    })
                    .sorted(Comparator.comparing(ProjectSkillMemberEvidenceResponse::getDisplayName,
                            String.CASE_INSENSITIVE_ORDER))
                    .toList();

            int qualifiedCount = (int) evidence.stream()
                    .filter(item -> Boolean.TRUE.equals(item.getMeetsRequiredLevel()))
                    .count();
            ProjectSkillCoverageStatus status;
            if (listedRows.isEmpty()) {
                status = teamProfileCount == 0
                        ? ProjectSkillCoverageStatus.UNKNOWN
                        : ProjectSkillCoverageStatus.NOT_LISTED;
            } else if (requirement.getRequiredLevel() == null) {
                status = ProjectSkillCoverageStatus.UNKNOWN;
            } else if (qualifiedCount > 0) {
                status = ProjectSkillCoverageStatus.COVERED;
            } else {
                status = ProjectSkillCoverageStatus.PARTIALLY_COVERED;
            }

            switch (status) {
                case COVERED -> covered++;
                case PARTIALLY_COVERED -> partiallyCovered++;
                case NOT_LISTED -> notListed++;
                case UNKNOWN -> unknown++;
            }
            String note = switch (status) {
                case COVERED -> "At least one member profile meets the required proficiency level.";
                case PARTIALLY_COVERED -> "The skill is listed by the team, but no listed proficiency level meets the requirement.";
                case NOT_LISTED -> "No current team member profile lists this skill.";
                case UNKNOWN -> listedRows.isEmpty()
                        ? "Team members have not provided skill profiles yet."
                        : "The project has not specified a required proficiency level for this skill.";
            };
            skillCoverage.add(new ProjectSkillCoverageResponse(
                    requirement.getSkill().getId(), requirement.getSkill().getName(),
                    requirement.getSkill().getCategory(), requirement.getRequiredLevel(), status, note,
                    listedRows.size(), qualifiedCount, evidence));
        }

        return new ProjectSkillAnalysisResponse(
                project.getId(), project.getTitle(), project.getStatus(), teamUsers.size(),
                teamProfileCount, Math.max(0, teamUsers.size() - teamProfileCount),
                requirements.size(), covered, partiallyCovered, notListed, unknown,
                List.copyOf(skillCoverage));
    }

    private String displayName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isEmpty() ? "Project member" : name;
    }
}
