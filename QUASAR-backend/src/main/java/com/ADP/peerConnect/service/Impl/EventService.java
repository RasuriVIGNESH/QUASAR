package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.EventStatus;
import com.ADP.peerConnect.repository.EventRepository;
import com.ADP.peerConnect.service.Interface.iEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@Transactional(readOnly = true)
public class EventService implements iEventService {

    @Autowired
    private EventRepository EventReopsitory;

    @Override
    @Transactional
    public Event createEvent(Event event) {
        // Persist a new event
        return EventReopsitory.save(event);
    }

    /**
     * Get event by ID
     *
     * @param EventId Event ID
     * @return Event entity
     * @throws RuntimeException if event not found
     */
    public Event getEvent(Long EventId) {
        return EventReopsitory.findById(EventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + EventId));
    }


    @Override
    public List<Project> getProjects(Long eventId) {
        return List.of();
    }

    @Override
    public List<Event> getEventsByUserId(Long userId) {
        return List.of();
    }

    @Override
    public List<Event> getAllEvents() {
        // Return all events regardless of status
        return EventReopsitory.findAll();
    }

    @Override
    @Transactional
    public Event updateEvent(Event event) {
        Long id = event.getId();
        Event existing = EventReopsitory.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        // Update mutable fields
        existing.setName(event.getName());
        existing.setDescription(event.getDescription());
        existing.setStartDate(event.getStartDate());
        existing.setEndDate(event.getEndDate());
        existing.setStartRegisterDate(event.getStartRegisterDate());
        existing.setEndRegistrationDate(event.getEndRegistrationDate());
        existing.setStatus(event.getStatus());

        return EventReopsitory.save(existing);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Event existing = EventReopsitory.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        EventReopsitory.delete(existing);
    }

    @Override
    public List<Event> getUpcomingEvents() {
        // Return events with UPCOMING status ordered by startDate ascending
        return EventReopsitory.findByStatusOrderByStartDateAsc(EventStatus.UPCOMING);
    }

    @Override
    public void updateEventStatuses(Long eventId, EventStatus status) {

    }

    /**
     * Get users participating in an event (project leads and project members)
     */
    @Override
    public List<User> getEventUsers(Long eventId) {
        // This method is defined in EventRepository
        return EventReopsitory.findUsersByEventId(eventId);
    }

    /**
     * Get user count for an event (without loading all users)
     *
     * More efficient than loading all users and calling .size()
     */
    public Long getUserCount(Long eventId) {
        return EventReopsitory.countUsersByEventId(eventId);
    }

    /**
     * Check if a user is registered for an event
     */
    public boolean existsUserInEvent(Long eventId, String userId) {
        return EventReopsitory.countUserInEvent(eventId, userId) > 0;
    }

    @Override
    public List<Event> getRecentEvents(int limit) {
        if (limit <= 0) return List.of();
        // Use the optimized repository method when limit == 10
        if (limit == 10) {
            return EventReopsitory.findTop10ByOrderByCreatedAtDesc();
        }
        // Otherwise use pageable query
        Pageable pageable = PageRequest.of(0, limit);
        return EventReopsitory.findAll(pageable).getContent();
    }

}
