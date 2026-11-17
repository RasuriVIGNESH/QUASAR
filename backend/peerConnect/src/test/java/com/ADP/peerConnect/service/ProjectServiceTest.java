package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ProjectDeletedException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.enums.ProjectStatus;
import com.ADP.peerConnect.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {
    @Mock ProjectRepository projects; @Mock UserService users; @Mock ProjectCategoryService categories; @Mock SkillService skills;
    @Mock ProjectSkillRepository projectSkills; @Mock ProjectRoleService roles; @Mock CollaborationRequestLifecycleService lifecycle;
    @Mock TeamRepo teams; @Mock EventRepository events; @Mock EntityManager entityManager;
    private ProjectService service;
    @BeforeEach void setUp() {
        service = new ProjectService();
        ReflectionTestUtils.setField(service, "projectRepository", projects); ReflectionTestUtils.setField(service, "userService", users);
        ReflectionTestUtils.setField(service, "projectCategoryService", categories); ReflectionTestUtils.setField(service, "skillService", skills);
        ReflectionTestUtils.setField(service, "projectSkillRepository", projectSkills); ReflectionTestUtils.setField(service, "projectRoleService", roles);
        ReflectionTestUtils.setField(service, "requestLifecycleService", lifecycle); ReflectionTestUtils.setField(service, "teamRepo", teams);
        ReflectionTestUtils.setField(service, "eventRepo", events); ReflectionTestUtils.setField(service, "entityManager", entityManager);
    }
    @Test void findByIdReturnsProjectAndRejectsMissingOrDeleted() {
        Project p = new Project(); p.setId("p1"); p.setStatus(ProjectStatus.RECRUITING);
        when(projects.findByIdWithAssociations("p1")).thenReturn(Optional.of(p)); assertSame(p, service.findById("p1"));
        when(projects.findByIdWithAssociations("missing")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.findById("missing"));
        p.setStatus(ProjectStatus.DELETED); assertThrows(ProjectDeletedException.class, () -> service.findById("p1"));
    }
    @Test void findProjectsInCollegeRejectsNonNumericIdBeforeRepositoryCall() {
        assertThrows(BadRequestException.class, () -> service.findProjectsInCollege("college", org.springframework.data.domain.PageRequest.of(0, 10)));
        verifyNoInteractions(projects);
    }
}
