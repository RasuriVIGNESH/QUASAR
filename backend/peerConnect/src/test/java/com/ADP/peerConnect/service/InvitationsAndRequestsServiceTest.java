package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.enums.RequestType;
import com.ADP.peerConnect.repository.InvitationsAndRequestsRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvitationsAndRequestsServiceTest {
    @Mock InvitationsAndRequestsRepository repository; @Mock TeamService teams; @Mock UserService users; @Mock ProjectService projects;
    @Mock ProjectRoleService roles; @Mock InboxNotificationService notifications; @Mock CollaborationRequestLifecycleService lifecycle; @Mock EntityManager entityManager;
    private InvitationsAndRequestsService service;
    @BeforeEach void setUp() {
        service = new InvitationsAndRequestsService(repository, teams, users, projects, roles, notifications, lifecycle);
        org.springframework.test.util.ReflectionTestUtils.setField(service, "entityManager", entityManager);
    }
    @Test void projectJoinRequestsAreLeadOnly() {
        when(teams.isLead("p1", "outsider")).thenReturn(false);
        assertThrows(ForbiddenException.class, () -> service.getProjectJoinRequests("p1", "outsider", PageRequest.of(0, 10)));
        verifyNoInteractions(projects, repository);
    }
    @Test void userInvitationPageMapsEmptyRepositoryPage() {
        when(repository.findByTargetUserIdAndTypeWithAssociations(eq("u1"), eq(RequestType.INVITATION), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of()));
        assertTrue(service.getUserInvitations("u1", PageRequest.of(0, 10)).isEmpty());
    }
}
