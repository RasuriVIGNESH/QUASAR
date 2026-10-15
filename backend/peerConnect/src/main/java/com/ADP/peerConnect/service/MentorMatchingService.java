package com.ADP.peerConnect.service;

import com.ADP.peerConnect.model.dto.response.MentorMatchResponse;
import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.entity.Mentor;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.repository.MentorRepository;
import com.ADP.peerConnect.repository.UserRepository;
import com.ADP.peerConnect.repository.UserSkillRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MentorMatchingService {
    private static final int MAX_CANDIDATES = 1000;

    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;
    private final UserSkillRepository userSkillRepository;

    public MentorMatchingService(UserRepository userRepository, MentorRepository mentorRepository,
                                 UserSkillRepository userSkillRepository) {
        this.userRepository = userRepository;
        this.mentorRepository = mentorRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @Transactional(readOnly = true)
    public List<MentorMatchResponse> findMatches(String userId, int limit) {
        if (limit < 1 || limit > 100) {
            throw new BadRequestException("limit must be between 1 and 100");
        }
        userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Set<Long> studentSkillIds = userSkillRepository.findByUserIdWithSkill(userId).stream()
                .map(row -> row.getSkill().getId())
                .collect(Collectors.toSet());
        if (studentSkillIds.isEmpty()) return List.of();

        List<Mentor> mentors = mentorRepository.findActiveWithUser(
                PageRequest.of(0, MAX_CANDIDATES, Sort.by(Sort.Direction.ASC, "id"))).getContent();
        List<Mentor> filtered = mentors.stream()
                .filter(mentor -> !mentor.getUser().getId().equals(userId))
                .toList();
        if (filtered.isEmpty()) return List.of();

        List<String> mentorUserIds = filtered.stream().map(mentor -> mentor.getUser().getId()).distinct().toList();
        Map<String, Map<Long, String>> mentorSkills = new HashMap<>();
        for (UserSkill row : userSkillRepository.findAllByUserIdsWithSkill(new ArrayList<>(mentorUserIds))) {
            mentorSkills.computeIfAbsent(row.getUser().getId(), ignored -> new HashMap<>())
                    .put(row.getSkill().getId(), row.getSkill().getName());
        }

        return filtered.stream()
                .map(mentor -> {
                    Map<Long, String> namesBySkill = mentorSkills.getOrDefault(mentor.getUser().getId(), Map.of());
                    List<String> matched = namesBySkill.entrySet().stream()
                            .filter(entry -> studentSkillIds.contains(entry.getKey()))
                            .map(Map.Entry::getValue)
                            .distinct()
                            .sorted(String.CASE_INSENSITIVE_ORDER)
                            .toList();
                    return new MentorMatchResponse(mentor.getUser().getId(), mentor.getUser().getFirstName(),
                            mentor.getUser().getLastName(), mentor.getDepartment(), mentor.getDesignation(),
                            matched.size(), matched);
                })
                .filter(match -> match.score() > 0)
                .sorted(java.util.Comparator.comparingInt(MentorMatchResponse::score).reversed()
                        .thenComparing(match -> match.lastName() == null ? "" : match.lastName(), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(MentorMatchResponse::mentorUserId))
                .limit(limit)
                .toList();
    }
}
