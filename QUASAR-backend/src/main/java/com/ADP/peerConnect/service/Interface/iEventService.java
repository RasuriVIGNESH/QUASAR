package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.enums.EventStatus;

import java.util.List;

public interface iEventService {
    public Event createEvent(Event event);
    public Event getEvent(Long id);
    public List<User> getEventUsers(Long eventId);
    public List<Project> getProjects(Long eventId);
    public List<Event> getEventsByUserId(Long userId);
    public List<Event> getAllEvents();

    public Event updateEvent(Event event);
    public void deleteEvent(Long id);

    public List<Event> getUpcomingEvents();
    public void updateEventStatuses(Long eventId, EventStatus status);

    // New: fetch most recent events (limit)
    public List<Event> getRecentEvents(int limit);

}
