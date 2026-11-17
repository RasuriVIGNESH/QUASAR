package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {
    @Mock UserRepository users; @Mock ProjectRepository projects; @Mock ProjectSkillRepository projectSkills; @Mock UserSkillRepository userSkills;
    @Mock TeamRepo teams; @Mock InvitationsAndRequestsRepository requests; @Mock RecommendationFeedbackRepository feedbacks; @Mock RecommendationScoringService scoring;
    private RecommendationService service;
    @BeforeEach void setUp() { service = new RecommendationService(users, projects, projectSkills, userSkills, teams, requests, feedbacks, scoring); }
    @Test void recommendProjectsRejectsMissingAndNonStudent() {
        when(users.findById("missing")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.recommendProjects("missing", PageRequest.of(0, 10)));
        User mentor = new User(); mentor.setId("m1"); mentor.setRole(Role.MENTOR); when(users.findById("m1")).thenReturn(Optional.of(mentor));
        assertThrows(ForbiddenException.class, () -> service.recommendProjects("m1", PageRequest.of(0, 10)));
    }
    @Test void recommendProjectsReturnsEmptyWhenStudentHasNoSkills() {
        User student = new User(); student.setId("s1"); student.setRole(Role.STUDENT); when(users.findById("s1")).thenReturn(Optional.of(student));
        when(userSkills.findByUserIdWithSkill("s1")).thenReturn(java.util.List.of());
        assertTrue(service.recommendProjects("s1", PageRequest.of(0, 10)).isEmpty());
        verifyNoInteractions(projects, requests, feedbacks);
    }
}
