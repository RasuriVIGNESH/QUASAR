package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.exception.ConflictException;
import com.ADP.peerConnect.exception.ResourceNotFoundException;
import com.ADP.peerConnect.model.dto.request.User.AddUserSkill;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.SkillLevel;
import com.ADP.peerConnect.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserSkillServiceTest {
    @Mock UserSkillRepository repository;
    @Mock UserService userService;
    @Mock SkillService skillService;
    private UserSkillService service;

    @BeforeEach void setUp() {
        service = new UserSkillService();
        ReflectionTestUtils.setField(service, "userSkillRepository", repository);
        ReflectionTestUtils.setField(service, "userService", userService);
        ReflectionTestUtils.setField(service, "skillService", skillService);
    }

    @Test void addUserSkillCreatesAndIncrementsSkill() {
        User user = new User(); user.setId("u1");
        Skill skill = new Skill("Java"); skill.setId(4L);
        when(repository.existsByUserIdAndSkillNameIgnoreCase("u1", "Java")).thenReturn(false);
        when(skillService.findOrCreateSkill("Java", "Languages")).thenReturn(skill);
        when(userService.findById("u1")).thenReturn(user);
        when(repository.save(any(UserSkill.class))).thenAnswer(i -> i.getArgument(0));

        UserSkill result = service.addUserSkill("u1", "Java", SkillLevel.ADVANCED, "API work", "Languages");
        assertSame(user, result.getUser()); assertSame(skill, result.getSkill());
        assertEquals(SkillLevel.ADVANCED, result.getLevel());
        verify(skillService).incrementUsers(skill);
    }

    @Test void addUserSkillRejectsInvalidAndDuplicateInput() {
        assertThrows(BadRequestException.class, () -> service.addUserSkill("u1", " ", SkillLevel.BEGINNER, null, null));
        assertThrows(BadRequestException.class, () -> service.addUserSkill("u1", "Java", null, null, null));
        when(repository.existsByUserIdAndSkillNameIgnoreCase("u1", "Java")).thenReturn(true);
        assertThrows(ConflictException.class, () -> service.addUserSkill("u1", "Java", SkillLevel.BEGINNER, null, null));
        verifyNoInteractions(skillService, userService);
    }

    @Test void addUserSkillsRejectsEmptyAndSkipsInvalidOrDuplicateRows() {
        assertThrows(BadRequestException.class, () -> service.addUserSkills("u1", List.of()));
        User user = new User(); user.setId("u1"); when(userService.findById("u1")).thenReturn(user);
        AddUserSkill invalid = new AddUserSkill("", SkillLevel.BEGINNER, null, null);
        AddUserSkill duplicate = new AddUserSkill("Java", SkillLevel.ADVANCED, null, null);
        when(repository.existsByUserIdAndSkillNameIgnoreCase("u1", "Java")).thenReturn(true);
        assertTrue(service.addUserSkills("u1", List.of(invalid, duplicate)).isEmpty());
        verify(repository, never()).saveAll(any());
    }

    @Test void removeUserSkillRejectsMissingOrForeignSkill() {
        when(repository.findByIdWithAssociations(9L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.removeUserSkill("u1", 9L));
        UserSkill row = new UserSkill(); User owner = new User(); owner.setId("other"); row.setUser(owner);
        when(repository.findByIdWithAssociations(9L)).thenReturn(Optional.of(row));
        assertThrows(BadRequestException.class, () -> service.removeUserSkill("u1", 9L));
        verify(repository, never()).delete(any());
    }
}
