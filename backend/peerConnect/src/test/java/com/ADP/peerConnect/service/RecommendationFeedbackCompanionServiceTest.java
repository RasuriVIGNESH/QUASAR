package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.RecommendationFeedback;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.FeedbackAction;
import com.ADP.peerConnect.model.enums.Role;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.RecommendationFeedbackRepository;
import com.ADP.peerConnect.repository.TeamRepo;
import com.ADP.peerConnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationFeedbackCompanionServiceTest {
    @Mock RecommendationFeedbackRepository feedbacks; @Mock UserRepository users; @Mock ProjectRepository projects; @Mock TeamRepo teams;
    private RecommendationFeedbackCompanionService service;
    @BeforeEach void setUp() { service = new RecommendationFeedbackCompanionService(feedbacks, users, projects, teams); }

    @Test void studentCanSaveAndUpdateProjectFeedback() {
        User student = new User(); student.setId("u1"); student.setRole(Role.STUDENT); Project project = new Project(); project.setId("p1");
        when(users.findById("u1")).thenReturn(Optional.of(student)); when(projects.findById("p1")).thenReturn(Optional.of(project));
        when(feedbacks.findByActorIdAndProjectIdAndCandidateUserIsNull("u1", "p1")).thenReturn(Optional.empty());
        when(feedbacks.save(any(RecommendationFeedback.class))).thenAnswer(i -> i.getArgument(0));
        assertNotNull(service.saveProjectFeedback("u1", "p1", FeedbackAction.SAVED));
        verify(feedbacks).save(any(RecommendationFeedback.class));
    }

    @Test void nonStudentAndInvalidPagingAreRejected() {
        User mentor = new User(); mentor.setId("m1"); mentor.setRole(Role.MENTOR); when(users.findById("m1")).thenReturn(Optional.of(mentor));
        assertThrows(ForbiddenException.class, () -> service.saveProjectFeedback("m1", "p1", FeedbackAction.SAVED));
        assertThrows(BadRequestException.class, () -> service.getSavedProjects("m1", 0, 51));
    }

    @Test void leadCanReadEmptySavedCandidatesPage() {
        Project project = new Project(); project.setId("p1"); when(projects.findById("p1")).thenReturn(Optional.of(project));
        when(teams.isLead("p1", "lead")).thenReturn(true);
        when(feedbacks.findByActorIdAndProjectIdAndActionOrderByUpdatedAtDesc(eq("lead"), eq("p1"), eq(FeedbackAction.SAVED), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));
        assertTrue(service.getSavedCandidates("lead", "p1", 0, 10).isEmpty());
    }
}
