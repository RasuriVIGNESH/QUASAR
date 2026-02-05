package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.EventRegistration;
import com.ADP.peerConnect.repository.EventRegistrationRepository;
import com.ADP.peerConnect.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EventRegistrationService {

    @Autowired
    private EventRegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    public EventRegistration register(Long eventId, String userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (registrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new ConflictException("User already registered for event");
        }

        EventRegistration reg = new EventRegistration(event, userId);
        return registrationRepository.save(reg);
    }

    public List<EventRegistration> getRegistrationsForEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public void unregister(Long eventId, String userId) {
        List<EventRegistration> regs = registrationRepository.findByEventId(eventId);
        for (EventRegistration r : regs) {
            if (r.getUserId().equals(userId)) {
                registrationRepository.delete(r);
                return;
            }
        }
        throw new ResourceNotFoundException("Registration not found");
    }
}
