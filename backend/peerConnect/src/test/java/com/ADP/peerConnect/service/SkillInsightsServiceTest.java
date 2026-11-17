package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SkillInsightsServiceTest {
    @Mock UserService users; @Mock UserSkillRepository userSkills; @Mock SkillInsightsRepository insights; @Mock ProjectRepository projects;
    @Mock ProjectSkillRepository projectSkills; @Mock TeamRepo teams; @Mock RecommendationService recommendations; @Mock RecommendationScoringService scoring;
    private SkillInsightsService service;
    @BeforeEach void setUp() { service = new SkillInsightsService(users, userSkills, insights, projects, projectSkills, teams, recommendations, scoring); }
    @Test void demandRejectsOversizedPageBeforeRepository() {
        assertThrows(BadRequestException.class, () -> service.getDemand("", "", PageRequest.of(0, 101)));
        verifyNoInteractions(insights);
    }
    @Test void studentAnalysisRequiresStudentRole() {
        User mentor = new User(); mentor.setId("m1"); mentor.setRole(Role.MENTOR); when(users.findById("m1")).thenReturn(mentor);
        assertThrows(ForbiddenException.class, () -> service.getStudentAnalysis("m1"));
        verifyNoInteractions(userSkills, insights, recommendations);
    }
}
