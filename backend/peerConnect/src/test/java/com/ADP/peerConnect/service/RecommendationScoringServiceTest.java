package com.ADP.peerConnect.service;

import com.ADP.peerConnect.model.entity.ProjectSkill;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.model.enums.AvailabilityStatus;
import com.ADP.peerConnect.model.enums.SkillLevel;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class RecommendationScoringServiceTest {
    private final RecommendationScoringService service = new RecommendationScoringService();

    @Test
    void scoresFullProjectSkillCoverageAndExplainsMatch() {
        Skill java = new Skill("Java");
        java.setId(1L);
        Skill sql = new Skill("SQL");
        sql.setId(2L);
        List<ProjectSkill> requirements = List.of(
                new ProjectSkill(null, java, SkillLevel.INTERMEDIATE),
                new ProjectSkill(null, sql, SkillLevel.BEGINNER));

        RecommendationScoringService.MatchScore result = service.scoreProjectForStudent(
                requirements,
                Map.of(1L, SkillLevel.ADVANCED, 2L, SkillLevel.BEGINNER),
                1,
                5);

        assertEquals(100, result.getScore());
        assertEquals(List.of("Java", "SQL"), result.getMatchedSkills());
        assertTrue(result.getMissingSkills().isEmpty());
        assertEquals(1.0, result.getLevelFit());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("every skill")));
    }

    @Test
    void reportsMissingSkillsAndCapsCapacityContribution() {
        Skill java = new Skill("Java");
        java.setId(1L);
        Skill sql = new Skill("SQL");
        sql.setId(2L);
        RecommendationScoringService.MatchScore result = service.scoreProjectForStudent(
                List.of(new ProjectSkill(null, java, SkillLevel.ADVANCED),
                        new ProjectSkill(null, sql, SkillLevel.BEGINNER)),
                Map.of(1L, SkillLevel.BEGINNER),
                10,
                5);

        assertEquals(List.of("Java"), result.getMatchedSkills());
        assertEquals(List.of("SQL"), result.getMissingSkills());
        assertTrue(result.getScore() >= 0 && result.getScore() <= 100);
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("SQL")));
    }

    @Test
    void scoresCandidateUsingAvailabilityAndWorkload() {
        Skill java = new Skill("Java");
        java.setId(1L);
        RecommendationScoringService.MatchScore result = service.scoreStudentForProject(
                List.of(new ProjectSkill(null, java, SkillLevel.INTERMEDIATE)),
                Map.of(1L, SkillLevel.ADVANCED),
                AvailabilityStatus.AVAILABLE,
                0);

        assertEquals(100, result.getScore());
        assertEquals(List.of("Java"), result.getMatchedSkills());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("AVAILABLE")));
    }

    @Test
    void handlesEmptyRequirementsAndLevelOrdering() {
        assertEquals(0, service.scoreProjectForStudent(List.of(), Map.of(), 0, 5).getScore());
        assertEquals(0, service.scoreStudentForProject(List.of(), Map.of(), AvailabilityStatus.AVAILABLE, 0).getScore());
        assertTrue(service.meetsRequiredLevel(SkillLevel.ADVANCED, SkillLevel.INTERMEDIATE));
        assertTrue(service.meetsRequiredLevel(SkillLevel.BEGINNER, null));
        assertFalse(service.meetsRequiredLevel(SkillLevel.BEGINNER, SkillLevel.ADVANCED));
        assertEquals(0, service.levelRank(SkillLevel.VIBE_CODING));
        assertEquals(3, service.levelRank(SkillLevel.ADVANCED));
    }
}
