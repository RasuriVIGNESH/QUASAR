package com.ADP.peerConnect.service;

import com.ADP.peerConnect.model.entity.ProjectSkill;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.model.enums.SkillLevel;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Pure scoring rules shared by both recommendation feeds. */
@Component
public class RecommendationScoringService {

    public MatchScore scoreProjectForStudent(
            List<ProjectSkill> requirements,
            Map<Long, SkillLevel> studentSkills,
            int currentTeamSize,
            int maxTeamSize) {
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        double levelFitTotal = 0.0;

        for (ProjectSkill requirement : requirements) {
            Skill skill = requirement.getSkill();
            SkillLevel candidateLevel = studentSkills.get(skill.getId());
            if (candidateLevel == null) {
                missing.add(skill.getName());
                continue;
            }
            matched.add(skill.getName());
            levelFitTotal += levelFit(candidateLevel, requirement.getRequiredLevel());
        }

        if (requirements.isEmpty()) {
            return new MatchScore(0, matched, missing, 0.0);
        }

        double coverage = (double) matched.size() / requirements.size();
        double levelFit = levelFitTotal / requirements.size();
        double capacityFit = maxTeamSize <= 0 ? 0.0
                : Math.max(0.0, Math.min(1.0, (double) (maxTeamSize - currentTeamSize) / maxTeamSize));
        int score = clamp((int) Math.round(70 * coverage + 25 * levelFit + 5 * capacityFit));

        List<String> reasons = new ArrayList<>();
        if (!matched.isEmpty()) {
            reasons.add("Your profile matches " + matched.size() + " of " + requirements.size() + " requested skills.");
        }
        if (!missing.isEmpty()) {
            reasons.add("Skills not currently on your profile: " + String.join(", ", missing) + ".");
        }
        if (coverage == 1.0) {
            reasons.add("You cover every skill listed for this project.");
        }
        return new MatchScore(score, matched, missing, levelFit, reasons);
    }

    public MatchScore scoreStudentForProject(
            List<ProjectSkill> uncoveredRequirements,
            Map<Long, SkillLevel> candidateSkills,
            AvailabilityStatus availabilityStatus,
            int activeProjectCount) {
        List<String> covered = new ArrayList<>();
        double levelFitTotal = 0.0;

        for (ProjectSkill requirement : uncoveredRequirements) {
            SkillLevel candidateLevel = candidateSkills.get(requirement.getSkill().getId());
            if (candidateLevel == null) {
                continue;
            }
            covered.add(requirement.getSkill().getName());
            levelFitTotal += levelFit(candidateLevel, requirement.getRequiredLevel());
        }

        if (uncoveredRequirements.isEmpty()) {
            return new MatchScore(0, covered, List.of(), 0.0);
        }

        double coverage = (double) covered.size() / uncoveredRequirements.size();
        double levelFit = levelFitTotal / uncoveredRequirements.size();
        double availabilityFit = availabilityStatus == AvailabilityStatus.AVAILABLE ? 1.0
                : availabilityStatus == AvailabilityStatus.BUSY ? 0.4 : 0.0;
        double workloadFit = Math.max(0.0, Math.min(1.0, 1.0 - Math.max(0, activeProjectCount) / 5.0));
        int score = clamp((int) Math.round(70 * coverage + 20 * levelFit + 5 * availabilityFit + 5 * workloadFit));

        List<String> reasons = new ArrayList<>();
        if (!covered.isEmpty()) {
            reasons.add("Can help fill " + covered.size() + " of " + uncoveredRequirements.size() + " uncovered project skills.");
            reasons.add("Relevant skills: " + String.join(", ", covered) + ".");
        }
        if (availabilityStatus != null) {
            reasons.add("Availability: " + availabilityStatus.name().toLowerCase().replace('_', ' ') + ".");
        }
        reasons.add("Currently active on " + Math.max(0, activeProjectCount) + " other project(s).");
        return new MatchScore(score, covered, List.of(), levelFit, reasons);
    }

    private double levelFit(SkillLevel candidate, SkillLevel required) {
        if (required == null) {
            return 1.0;
        }
        if (candidate == null) {
            return 0.0;
        }
        int difference = levelRank(candidate) - levelRank(required);
        if (difference >= 0) return 1.0;
        return switch (difference) {
            case -1 -> 0.6;
            case -2 -> 0.25;
            default -> 0.0;
        };
    }

    private int levelRank(SkillLevel level) {
        return switch (level) {
            case VIBE_CODING -> 0;
            case BEGINNER -> 1;
            case INTERMEDIATE -> 2;
            case ADVANCED -> 3;
        };
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    public static final class MatchScore {
        private final int score;
        private final List<String> matchedSkills;
        private final List<String> missingSkills;
        private final double levelFit;
        private final List<String> reasons;

        public MatchScore(int score, List<String> matchedSkills, List<String> missingSkills, double levelFit) {
            this(score, matchedSkills, missingSkills, levelFit, List.of());
        }

        public MatchScore(int score, List<String> matchedSkills, List<String> missingSkills,
                          double levelFit, List<String> reasons) {
            this.score = score;
            this.matchedSkills = List.copyOf(matchedSkills);
            this.missingSkills = List.copyOf(missingSkills);
            this.levelFit = levelFit;
            this.reasons = List.copyOf(reasons);
        }

        public int getScore() { return score; }
        public List<String> getMatchedSkills() { return matchedSkills; }
        public List<String> getMissingSkills() { return missingSkills; }
        public double getLevelFit() { return levelFit; }
        public List<String> getReasons() { return reasons; }
    }
}
