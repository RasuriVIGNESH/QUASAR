package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.model.dto.response.MemberRecommendationResult;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.dto.response.ProjectRecommendationResult;
import com.ADP.peerConnect.model.dto.response.ProjectSkillGapResult;
import com.ADP.peerConnect.model.dto.response.UserCardResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.model.enums.FeedbackAction;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.model.enums.SkillLevel;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private static final int MAX_CANDIDATES = 1000;

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSkillRepository projectSkillRepository;
    private final UserSkillRepository userSkillRepository;
    private final TeamRepo teamRepository;
    private final InvitationsAndRequestsRepository requestsRepository;
    private final RecommendationFeedbackRepository feedbackRepository;
    private final RecommendationScoringService scoringService;

    public RecommendationService(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectSkillRepository projectSkillRepository,
            UserSkillRepository userSkillRepository,
            TeamRepo teamRepository,
            InvitationsAndRequestsRepository requestsRepository,
            RecommendationFeedbackRepository feedbackRepository,
            RecommendationScoringService scoringService) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectSkillRepository = projectSkillRepository;
        this.userSkillRepository = userSkillRepository;
        this.teamRepository = teamRepository;
        this.requestsRepository = requestsRepository;
        this.feedbackRepository = feedbackRepository;
        this.scoringService = scoringService;
    }

    /**
     * Ranks the most recently updated eligible project candidate window for the signed-in student.
     * No recommendation rows are persisted; profile/project changes are reflected immediately.
     */
    public Page<ProjectRecommendationResult> recommendProjects(String studentId, Pageable pageable) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (student.getRole() != Role.STUDENT) {
            throw new ForbiddenException("Student account required for project recommendations");
        }

        List<UserSkill> studentSkillRows = userSkillRepository.findByUserIdWithSkill(studentId);
        if (studentSkillRows.isEmpty()) {
            return Page.empty(pageable);
        }
        Map<Long, SkillLevel> studentSkills = studentSkillRows.stream()
                .collect(Collectors.toMap(row -> row.getSkill().getId(), UserSkill::getLevel, (a, b) -> a));

        Page<Project> projectPage = projectRepository.findDiscoverProjectsForUser(
                studentId, ProjectStatus.RECRUITING,
                PageRequest.of(0, MAX_CANDIDATES));
        if (projectPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Project> projects = projectPage.getContent();
        Map<String, List<ProjectSkill>> requirementsByProject = loadProjectSkills(projects);
        Set<String> pendingProjectIds = new HashSet<>(
                requestsRepository.findProjectIdsByTargetUserIdAndStatus(studentId, Status.PENDING));
        Set<String> hiddenProjectIds = new HashSet<>(feedbackRepository
                .findProjectIdsByActorIdAndCandidateUserIsNullAndActionIn(studentId,
                        List.of(FeedbackAction.DISMISSED, FeedbackAction.NOT_RELEVANT)));

        List<ProjectRecommendationResult> ranked = projects.stream()
                .filter(project -> !pendingProjectIds.contains(project.getId()) && !hiddenProjectIds.contains(project.getId()))
                .map(project -> {
                    List<ProjectSkill> requirements = requirementsByProject.getOrDefault(project.getId(), List.of());
                    RecommendationScoringService.MatchScore score = scoringService.scoreProjectForStudent(
                            requirements, studentSkills, safeInt(project.getCurrentTeamSize()), safeInt(project.getMaxTeamSize()));
                    if (score.getMatchedSkills().isEmpty()) return null;
                    ProjectCardResponse card = new ProjectCardResponse(project, requirements);
                    return new ProjectRecommendationResult(card, score.getScore(), score.getMatchedSkills(),
                            score.getMissingSkills(), score.getReasons());
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(ProjectRecommendationResult::getMatchScore).reversed()
                        .thenComparing(item -> item.getProject().getTitle(), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(item -> item.getProject().getId()))
                .toList();

        return paginate(ranked, pageable);
    }

    /** Returns a lead-only candidate list ranked against the project's currently uncovered skill requirements. */
    public Page<MemberRecommendationResult> recommendMembers(String projectId, String requesterId, Pageable pageable) {
        Project project = projectRepository.findByIdWithAssociations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!teamRepository.isLead(projectId, requesterId)) {
            throw new ForbiddenException("Only the project lead can view recommended members");
        }
        if (project.getStatus() != ProjectStatus.RECRUITING || isFull(project)) {
            return Page.empty(pageable);
        }

        List<ProjectSkill> requirements = projectSkillRepository.findSkillsByProjectIds(List.of(projectId));
        if (requirements.isEmpty()) {
            return Page.empty(pageable);
        }

        Team team = teamRepository.findTeamWithLeadAndMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found"));
        Set<String> teamUserIds = new HashSet<>();
        teamUserIds.add(team.getLead().getId());
        team.getMembers().forEach(member -> teamUserIds.add(member.getId()));

        Map<Long, List<SkillLevel>> existingTeamSkills = new HashMap<>();
        if (!teamUserIds.isEmpty()) {
            userSkillRepository.findAllByUserIdsWithSkill(new ArrayList<>(teamUserIds)).forEach(row ->
                    existingTeamSkills.computeIfAbsent(row.getSkill().getId(), ignored -> new ArrayList<>()).add(row.getLevel()));
        }
        List<ProjectSkill> gaps = requirements.stream()
                .filter(requirement -> !isCovered(requirement, existingTeamSkills.get(requirement.getSkill().getId())))
                .toList();
        if (gaps.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> gapSkillIds = gaps.stream().map(ps -> ps.getSkill().getId()).distinct().toList();
        Page<User> candidates = userRepository.findAvailableRecommendationCandidates(
                gapSkillIds, team.getLead().getId(), PageRequest.of(0, MAX_CANDIDATES));
        if (candidates.isEmpty()) {
            return Page.empty(pageable);
        }

        List<User> filteredCandidates = candidates.getContent().stream()
                .filter(candidate -> !teamUserIds.contains(candidate.getId()))
                .toList();
        if (filteredCandidates.isEmpty()) {
            return Page.empty(pageable);
        }

        Set<String> candidateIds = filteredCandidates.stream().map(User::getId).collect(Collectors.toSet());
        Set<String> pendingUserIds = new HashSet<>(
                requestsRepository.findTargetUserIdsByProjectIdAndStatus(projectId, Status.PENDING));
        Set<String> hiddenUserIds = new HashSet<>(feedbackRepository
                .findCandidateUserIdsByActorIdAndProjectIdAndActionIn(requesterId, projectId,
                        List.of(FeedbackAction.DISMISSED, FeedbackAction.NOT_RELEVANT)));
        Map<String, Map<Long, SkillLevel>> candidateSkills = loadUserSkills(candidateIds);
        Map<String, Integer> activeProjectCounts = new HashMap<>();
        teamRepository.findActiveProjectCountsByUserIds(new ArrayList<>(candidateIds))
                .forEach(row -> activeProjectCounts.put(row.getUserId(), row.getProjectCount().intValue()));

        List<MemberRecommendationResult> ranked = filteredCandidates.stream()
                .filter(candidate -> !pendingUserIds.contains(candidate.getId()) && !hiddenUserIds.contains(candidate.getId()))
                .map(candidate -> {
                    int activeProjectCount = activeProjectCounts.getOrDefault(candidate.getId(), 0);
                    RecommendationScoringService.MatchScore score = scoringService.scoreStudentForProject(
                            gaps, candidateSkills.getOrDefault(candidate.getId(), Map.of()),
                            candidate.getAvailabilityStatus(), activeProjectCount);
                    if (score.getMatchedSkills().isEmpty()) return null;
                    return new MemberRecommendationResult(new UserCardResponse(candidate), score.getScore(),
                            candidate.getAvailabilityStatus(), activeProjectCount, score.getMatchedSkills(), score.getReasons());
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(MemberRecommendationResult::getMatchScore).reversed()
                        .thenComparing(item -> item.getStudent().getFirstName() == null ? "" : item.getStudent().getFirstName(),
                                String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(item -> item.getStudent().getId()))
                .toList();

        return paginate(ranked, pageable);
    }

    /** Team composition view showing whether current members cover each requested skill level. */
    public List<ProjectSkillGapResult> getProjectSkillGaps(String projectId, String requesterId) {
        projectRepository.findByIdWithAssociations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (!teamRepository.isLead(projectId, requesterId)) {
            throw new ForbiddenException("Only the project lead can view team skill gaps");
        }
        List<ProjectSkill> requirements = projectSkillRepository.findSkillsByProjectIds(List.of(projectId));
        if (requirements.isEmpty()) return List.of();

        Team team = teamRepository.findTeamWithLeadAndMembers(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project team not found"));
        Map<String, User> teamUsers = new LinkedHashMap<>();
        teamUsers.put(team.getLead().getId(), team.getLead());
        team.getMembers().forEach(user -> teamUsers.put(user.getId(), user));

        Map<Long, List<UserSkill>> skillsBySkill = new HashMap<>();
        userSkillRepository.findAllByUserIdsWithSkill(new ArrayList<>(teamUsers.keySet())).forEach(row ->
                skillsBySkill.computeIfAbsent(row.getSkill().getId(), ignored -> new ArrayList<>()).add(row));

        List<ProjectSkillGapResult> results = new ArrayList<>();
        for (ProjectSkill requirement : requirements) {
            List<UserSkill> matchingRows = skillsBySkill.getOrDefault(requirement.getSkill().getId(), List.of());
            List<String> qualified = matchingRows.stream()
                    .filter(row -> scoringService.meetsRequiredLevel(row.getLevel(), requirement.getRequiredLevel()))
                    .map(row -> teamUsers.get(row.getUser().getId()))
                    .filter(Objects::nonNull)
                    .map(this::displayName)
                    .distinct()
                    .sorted(String.CASE_INSENSITIVE_ORDER)
                    .toList();
            String coverage = !qualified.isEmpty() ? "COVERED"
                    : matchingRows.isEmpty() ? "MISSING" : "NEEDS_MORE";
            results.add(new ProjectSkillGapResult(requirement.getSkill().getId(), requirement.getSkill().getName(),
                    requirement.getRequiredLevel(), coverage, qualified));
        }
        return List.copyOf(results);
    }

    private Map<String, List<ProjectSkill>> loadProjectSkills(List<Project> projects) {
        List<String> projectIds = projects.stream().map(Project::getId).distinct().toList();
        if (projectIds.isEmpty()) return Map.of();
        Map<String, List<ProjectSkill>> grouped = projectSkillRepository.findSkillsByProjectIds(projectIds).stream()
                .collect(Collectors.groupingBy(row -> row.getProject().getId()));
        return grouped;
    }

    private Map<String, Map<Long, SkillLevel>> loadUserSkills(Set<String> userIds) {
        if (userIds.isEmpty()) return Map.of();
        Map<String, Map<Long, SkillLevel>> result = new HashMap<>();
        userSkillRepository.findAllByUserIdsWithSkill(new ArrayList<>(userIds)).forEach(row ->
                result.computeIfAbsent(row.getUser().getId(), ignored -> new HashMap<>())
                        .put(row.getSkill().getId(), row.getLevel()));
        return result;
    }

    private boolean isCovered(ProjectSkill requirement, List<SkillLevel> teamLevels) {
        if (teamLevels == null || teamLevels.isEmpty()) return false;
        if (requirement.getRequiredLevel() == null) return true;
        return teamLevels.stream().anyMatch(level ->
                scoringService.meetsRequiredLevel(level, requirement.getRequiredLevel()));
    }

    private boolean isFull(Project project) {
        Integer max = project.getMaxTeamSize();
        Integer current = project.getCurrentTeamSize();
        return max == null || current == null || current >= max;
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String displayName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isEmpty() ? "Team member" : name;
    }

    private <T> Page<T> paginate(List<T> all, Pageable pageable) {
        long offset = pageable.getOffset();
        if (offset >= all.size()) return new PageImpl<>(List.of(), pageable, all.size());
        int start = (int) offset;
        int end = Math.min(start + pageable.getPageSize(), all.size());
        return new PageImpl<>(all.subList(start, end), pageable, all.size());
    }
}
