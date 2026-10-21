package com.ADP.peerConnect.service;
import com.ADP.peerConnect.exception.*;

import com.ADP.peerConnect.model.dto.request.Project.CreateProject;
import com.ADP.peerConnect.model.dto.response.Project.ProjectCardResponse;
import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.EventStatus;
import com.ADP.peerConnect.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class EventService {

    @Autowired
    private EventRepository EventReopsitory;

    @Autowired
    private ProjectService projectService;


    public Event getEvent(Long EventId) {
        return EventReopsitory.findById(EventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + EventId));
    }

    @Transactional(readOnly = true)
    public List<ProjectCardResponse> getProjects(Long eventId) {
        return projectService.getAllProjectsInEvent(eventId);
    }

    public List<Event> getAllEvents() {
        return EventReopsitory.findAll();
    }

    public List<Event> getUpcomingEvents() {
        return EventReopsitory.findByStatusOrderByStartDateAsc(EventStatus.UPCOMING);
    }

    public List<User> getEventUsers(Long eventId) {
        return EventReopsitory.findUsersByEventId(eventId);
    }

    public Long getUserCount(Long eventId) {
        return EventReopsitory.countUsersByEventId(eventId);
    }

    public boolean existsUserInEvent(Long eventId, String userId) {
        return EventReopsitory.existsByEventIdAndUserId(eventId, userId);
    }


    public List<Event> getRecentEvents(int limit) {
        if (limit <= 0)
            return List.of();
        if (limit == 10) {
            return EventReopsitory.findTop10ByOrderByStartDateDesc();
        }
        Pageable pageable = PageRequest.of(0, limit);
        return EventReopsitory.findAll(pageable).getContent();
    }

    @Transactional
    public Event updateEvent(Event event) {
        Long id = event.getId();
        Event existing = EventReopsitory.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        existing.setName(event.getName());
        existing.setDescription(event.getDescription());
        existing.setStartDate(event.getStartDate());
        existing.setEndDate(event.getEndDate());
        existing.setStartRegisterDate(event.getStartRegisterDate());
        existing.setEndRegistrationDate(event.getEndRegistrationDate());
        existing.setStatus(event.getStatus());

        return EventReopsitory.save(existing);
    }
    @Transactional
    public void deleteEvent(Long id) {
        Event existing = EventReopsitory.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        EventReopsitory.delete(existing);
    }
    @Transactional
    public Event createEvent(Event event) {
        return EventReopsitory.save(event);
    }
        public Project register( String userId, CreateProject project) {
        Event event = EventReopsitory.findById(project.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (EventReopsitory.existsByEventIdAndUserId(project.getEventId(), userId)) {
            throw new AlreadyRegisteredForEventException();
        }
        return projectService.createProject(project, userId);
    }


}
