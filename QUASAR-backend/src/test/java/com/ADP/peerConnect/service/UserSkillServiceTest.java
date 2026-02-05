package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.BadRequestException;
import com.ADP.peerConnect.model.dto.request.User.AddUserSkillRequest;
import com.ADP.peerConnect.model.entity.Skill;
import com.ADP.peerConnect.model.entity.User;
import com.ADP.peerConnect.model.entity.UserSkill;
import com.ADP.peerConnect.model.enums.SkillLevel;
import com.ADP.peerConnect.repository.UserSkillRepository;
import com.ADP.peerConnect.service.Impl.UserSkillService;
import com.ADP.peerConnect.service.Impl.UserService;
import com.ADP.peerConnect.service.Impl.SkillService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

public class UserSkillServiceTest {

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private UserService userService;

    @Mock
    private SkillService skillService;

    @InjectMocks
    private UserSkillService userSkillService;

    private AutoCloseable mocks;

    @BeforeEach
    public void setup() {
        mocks = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    public void tearDown() throws Exception {
        if (mocks != null) {
            mocks.close();
        }
    }

    @Test
    public void testAddUserSkills_emptyList_throws() {
        assertThrows(BadRequestException.class, () -> userSkillService.addUserSkills("user1", null));
    }

    @Test
    public void testAddUserSkills_success() {
        User user = new User();
        user.setId("user1");
        when(userService.findById("user1")).thenReturn(user);

        AddUserSkillRequest r1 = new AddUserSkillRequest();
        r1.setSkillName("Java");
        r1.setLevel(SkillLevel.ADVANCED);

        AddUserSkillRequest r2 = new AddUserSkillRequest();
        r2.setSkillName("Python");
        r2.setLevel(SkillLevel.INTERMEDIATE);

        when(userSkillRepository.existsByUserIdAndSkillNameIgnoreCase(any(), any())).thenReturn(false);

        Skill s1 = new Skill(); s1.setName("Java");
        Skill s2 = new Skill(); s2.setName("Python");

        when(skillService.findOrCreateSkill("Java")).thenReturn(s1);
        when(skillService.findOrCreateSkill("Python")).thenReturn(s2);

        when(userSkillRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<UserSkill> added = userSkillService.addUserSkills("user1", Arrays.asList(r1, r2));

        assertEquals(2, added.size());
        verify(skillService, times(2)).incrementUsers(any());
    }
}
