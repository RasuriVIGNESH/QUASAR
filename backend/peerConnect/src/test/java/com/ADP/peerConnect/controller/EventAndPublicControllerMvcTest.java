package com.ADP.peerConnect.controller;

import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.enums.EventStatus;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.service.CollegeService;
import com.ADP.peerConnect.service.EventService;
import com.ADP.peerConnect.service.ProjectService;
import com.ADP.peerConnect.service.SkillService;
import com.ADP.peerConnect.service.UserService;
import com.ADP.peerConnect.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {EventController.class, publicEndpoints.class})
@AutoConfigureMockMvc(addFilters = false)
class EventAndPublicControllerMvcTest {
    @Autowired MockMvc mvc;
    @MockBean EventService eventService;
    @MockBean ProjectService projectService;
    @MockBean CollegeService collegeService;
    @MockBean SkillService skillService;
    @MockBean UserService userService;
    @MockBean org.modelmapper.ModelMapper modelMapper;
    @MockBean ProjectRepository projectRepository;

    @Test
    void eventLookupMapsEntityToStableResponseContract() throws Exception {
        Event event = new Event();
        event.setId(42L);
        event.setName("Spring Meetup");
        event.setDescription("A useful event description");
        event.setStatus(EventStatus.UPCOMING);
        event.setStartDate(LocalDate.of(2026, 12, 1));
        when(eventService.getEvent(42L)).thenReturn(event);

        mvc.perform(get("/api/events/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.name").value("Spring Meetup"))
                .andExpect(jsonPath("$.status").value("UPCOMING"))
                .andExpect(jsonPath("$.startDate").value("2026-12-01"));
    }

    @Test
    void recentEventsUsesExplicitLimitAndMapsAllResults() throws Exception {
        Event event = new Event();
        event.setId(1L);
        event.setName("Recent event");
        event.setDescription("A recent event description");
        when(eventService.getRecentEvents(3)).thenReturn(List.of(event));

        mvc.perform(get("/api/events/recent?limit=3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Recent event"));
        verify(eventService).getRecentEvents(3);
    }

    @Test
    void healthIsPublicAndHasExpectedLivenessBody() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("API is running"));
    }

    @Test
    void recentProjectsAlwaysRequestsNewestFirstFirstPage() throws Exception {
        when(projectService.getRecentProjects(any())).thenReturn(new PageImpl<ProjectCardResponse>(List.of()));

        mvc.perform(get("/api/RecentProjects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.pageNumber").value(0));
        verify(projectService).getRecentProjects(argThat(pageable -> pageable.getPageNumber() == 0
                && pageable.getPageSize() == 10
                && pageable.getSort().getOrderFor("createdAt").isDescending()));
    }
}
