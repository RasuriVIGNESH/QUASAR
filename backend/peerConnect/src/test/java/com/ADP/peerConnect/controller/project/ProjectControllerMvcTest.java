package com.ADP.peerConnect.controller.project;

import com.ADP.peerConnect.exception.ForbiddenException;
import com.ADP.peerConnect.model.dto.response.Project.TaskResponse;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.Task;
import com.ADP.peerConnect.security.UserPrincipal;
import com.ADP.peerConnect.service.ProjectCategoryService;
import com.ADP.peerConnect.service.ProjectService;
import com.ADP.peerConnect.service.TaskService;
import com.ADP.peerConnect.service.TeamService;
import com.ADP.peerConnect.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.http.MediaType.APPLICATION_JSON;

@WebMvcTest(controllers = ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerMvcTest {
    @Autowired MockMvc mvc;
    @MockBean ProjectService projectService;
    @MockBean TaskService taskService;
    @MockBean TeamService teamService;
    @MockBean ProjectCategoryService projectCategoryService;
    @MockBean ProjectRepository projectRepository;

    private UserPrincipal principal() {
        return new UserPrincipal("member-1", "member@example.com", "encoded", "Member", "One",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }
    private UsernamePasswordAuthenticationToken authenticationToken() {
        UserPrincipal p = principal();
        return new UsernamePasswordAuthenticationToken(p, null, p.getAuthorities());
    }

    @Test
    void createTaskValidatesTitleAndDoesNotInvokeServiceForInvalidJson() throws Exception {
        mvc.perform(post("/api/projects/project-1/tasks").with(authentication(authenticationToken()))
                        .contentType(APPLICATION_JSON)
                        .content("{\"title\":\"no\",\"description\":\"too short title\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.validationErrors.title").value("Title must be between 3 and 200 characters"));
        verifyNoInteractions(taskService);
    }

    @Test
    void getProjectTasksPassesPaginationAndReturnsTaskEnvelope() throws Exception {
        Project project = new Project();
        project.setId("project-1");
        project.setTitle("Useful project");
        project.setDescription("A sufficiently descriptive project");
        Task task = new Task();
        task.setId(7L);
        task.setTitle("Implement endpoint");
        task.setProject(project);
        com.ADP.peerConnect.model.entity.User creator = new com.ADP.peerConnect.model.entity.User();
        creator.setFirstName("Ada");
        creator.setLastName("Lovelace");
        task.setCreatedBy(creator);
        TaskResponse response = new TaskResponse(task);
        when(taskService.getProjectTaskResponses(eq("project-1"), any())).thenReturn(new PageImpl<>(List.of(response)));

        mvc.perform(get("/api/projects/project-1/tasks?page=2&size=5").with(authentication(authenticationToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(7))
                .andExpect(jsonPath("$.content[0].title").value("Implement endpoint"))
                .andExpect(jsonPath("$.pageNumber").value(0));
        verify(taskService).getProjectTaskResponses(eq("project-1"), argThat(p -> p.getPageNumber() == 2 && p.getPageSize() == 5));
    }
}
