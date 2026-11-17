package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.DuplicateCategoryException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.ProjectCategory;
import com.ADP.peerConnect.repository.ProjectCategoryRepository;
import com.ADP.peerConnect.repository.ProjectRepository;
import com.ADP.peerConnect.repository.ProjectSkillRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectCategoryAndDiscoveryServiceTest {
    @Mock ProjectCategoryRepository categories;
    @Mock ProjectRepository projects;
    @Mock ProjectSkillRepository projectSkills;

    @Test void categoryServiceListsFindsAndRejectsDuplicate() {
        ProjectCategory category = new ProjectCategory("AI");
        ProjectCategoryService service = new ProjectCategoryService(categories);
        when(categories.findAll()).thenReturn(List.of(category)); when(categories.findByName("AI")).thenReturn(Optional.of(category));
        assertEquals(1, service.listAll().size()); assertTrue(service.findByName("AI").isPresent());
        assertThrows(DuplicateCategoryException.class, () -> service.create("AI"));
        when(categories.findByName("Web")).thenReturn(Optional.empty()); when(categories.save(any())).thenAnswer(i -> i.getArgument(0));
        assertEquals("Web", service.create("Web").getName());
    }

    @Test void discoveryReturnsDetailsAndMissingProjectIsMeaningful() {
        ProjectDiscoveryService service = new ProjectDiscoveryService(projects, projectSkills);
        Project project = new Project(); project.setId("p1"); project.setTitle("Demo");
        when(projects.findByIdWithAssociations("p1")).thenReturn(Optional.of(project));
        when(projectSkills.findSkillsByProjectIds(List.of("p1"))).thenReturn(List.of());
        assertNotNull(service.getDiscoverableDetails("p1"));
        when(projects.findByIdWithAssociations("missing")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getDiscoverableDetails("missing"));
    }
}
