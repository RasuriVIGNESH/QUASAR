package com.ADP.peerConnect.service;

import com.ADP.peerConnect.model.dto.response.EventMatchResponse;
import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Event;
import com.ADP.peerConnect.model.entity.ProjectSkill;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.EventStatus;
import com.ADP.peerConnect.repository.EventRepository;
import com.ADP.peerConnect.repository.ProjectSkillRepository;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.repository.UserSkillRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EventMatchingService {
    private static final int MAX_CANDIDATES = 1000;

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ProjectSkillRepository projectSkillRepository;
    private final UserSkillRepository userSkillRepository;

    public EventMatchingService(UserRepository userRepository, EventRepository eventRepository,
                               ProjectSkillRepository projectSkillRepository,
                               UserSkillRepository userSkillRepository) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.projectSkillRepository = projectSkillRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @Transactional(readOnly = true)
    public List<EventMatchResponse> findMatches(String userId, int limit) {
        if (limit < 1 || limit > 100) {
            throw new BadRequestException("limit must be between 1 and 100");
        }
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        List<UserSkill> studentSkills = userSkillRepository.findByUserIdWithSkill(userId);
        if (studentSkills.isEmpty()) return List.of();
        Map<Long, String> studentSkillNames = studentSkills.stream()
                .collect(Collectors.toMap(row -> row.getSkill().getId(), row -> row.getSkill().getName(), (a, b) -> a));
        Set<Long> studentSkillIds = studentSkillNames.keySet();

        Page<Event> page = eventRepository.findByStatusInOrderByStartDateAsc(
                List.of(EventStatus.UPCOMING, EventStatus.ONGOING), PageRequest.of(0, MAX_CANDIDATES));
        List<Event> events = page.getContent().stream()
                .filter(event -> event.getEndDate() == null || !event.getEndDate().isBefore(LocalDate.now()))
                .toList();
        if (events.isEmpty()) return List.of();

        List<Long> eventIds = events.stream().map(Event::getId).toList();
        Map<Long, Set<Long>> eventSkillIds = new HashMap<>();
        Map<Long, Map<Long, String>> eventSkillNames = new HashMap<>();
        for (ProjectSkill projectSkill : projectSkillRepository.findSkillsByEventIds(eventIds)) {
            Long eventId = projectSkill.getProject().getEvent().getId();
            Long skillId = projectSkill.getSkill().getId();
            eventSkillIds.computeIfAbsent(eventId, ignored -> new HashSet<>()).add(skillId);
            eventSkillNames.computeIfAbsent(eventId, ignored -> new HashMap<>())
                    .putIfAbsent(skillId, projectSkill.getSkill().getName());
        }

        List<EventMatchResponse> ranked = new ArrayList<>();
        for (Event event : events) {
            Set<Long> required = eventSkillIds.getOrDefault(event.getId(), Set.of());
            if (required.isEmpty()) continue;
            List<String> matched = required.stream()
                    .filter(studentSkillIds::contains)
                    .map(skillId -> studentSkillNames.get(skillId))
                    .filter(name -> name != null)
                    .sorted(String.CASE_INSENSITIVE_ORDER)
                    .toList();
            if (matched.isEmpty()) continue;
            int score = (int) Math.round(100.0 * matched.size() / required.size());
            ranked.add(new EventMatchResponse(event.getId(), event.getName(), event.getDescription(), event.getStatus(),
                    event.getStartDate(), event.getEndDate(), score, matched));
        }
        return ranked.stream()
                .sorted(Comparator.comparingInt(EventMatchResponse::score).reversed()
                        .thenComparing(EventMatchResponse::startDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(EventMatchResponse::eventId))
                .limit(limit)
                .toList();
    }
}
