package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.dto.request.Auth.Login;
import com.ADP.peerConnect.model.dto.request.Auth.Register;
import com.ADP.peerConnect.model.dto.request.Project.*;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.enums.*;
import com.ADP.peerConnect.repository.*;
import com.ADP.peerConnect.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.PageRequest;
import software.amazon.awssdk.services.s3.S3Client;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceBusinessRulesTest {
    @Mock UserRepository userRepository;
    @Mock AuthenticationManager authenticationManager;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider tokenProvider;
    @Mock CollegeService collegeService;
    AuthService authService;

    @Test void registerRejectsInvalidEmailBeforePersistence() {
        Register request = validRegister(); request.setEmail("not-an-email");
        assertThrows(BadRequestException.class, () -> authService.register(request));
        verifyNoInteractions(userRepository, collegeService);
    }

    @Test void registerCreatesAvailableUserAndToken() {
        Register request = validRegister();
        College college = new College();
        User saved = new User(); saved.setId("u1"); saved.setEmail(request.getEmail()); saved.setFirstName("Ada"); saved.setLastName("Lovelace");
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(collegeService.getCollegeById(7L)).thenReturn(college);
        when(passwordEncoder.encode("Strong1pass")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(tokenProvider.generateTokenFromUserId(any(), any(), any(), any())).thenReturn("jwt");
        assertEquals("jwt", authService.register(request).getAccessToken());
        verify(userRepository).save(argThat(u -> u.getAvailabilityStatus() == AvailabilityStatus.AVAILABLE && u.getCollege() == college && u.getPassword().equals("encoded")));
    }

    @Test void registerRejectsDuplicateEmail() {
        Register request = validRegister(); when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);
        assertThrows(DuplicateAccountException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    private Register validRegister() {
        Register r = new Register(); r.setEmail("ada@example.com"); r.setPassword("Strong1pass"); r.setFirstName("Ada"); r.setLastName("Lovelace"); r.setCollegeId(7L); r.setBranch("Computer Science"); r.setGraduationYear(2026); return r;
    }

    @Mock UserRepository userRepo;
    UserService userService;

    @Test void userFindByIdReturnsEntityAndMissingIsMeaningful() {
        User user = new User(); user.setId("u1");
        when(userRepo.findById("u1")).thenReturn(Optional.of(user));
        assertSame(user, userService.findById("u1"));
        when(userRepo.findById("missing")).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> userService.findById("missing"));
    }

    @Mock SkillRepository skillRepository;
    SkillService skillService;

    @Test void skillCreationNormalizesAndRejectsDuplicateOrBlank() {
        when(skillRepository.existsByNormalizedName("java")).thenReturn(false);
        when(skillRepository.save(any(Skill.class))).thenAnswer(i -> i.getArgument(0));
        Skill skill = skillService.createSkill(" Java ", " Languages ");
        assertEquals("Java", skill.getName()); assertEquals("Languages", skill.getCategory());
        when(skillRepository.existsByNormalizedName("java")).thenReturn(true);
        assertThrows(DuplicateSkillException.class, () -> skillService.createSkill("java", null));
        assertThrows(BadRequestException.class, () -> skillService.createSkill(" ", null));
    }

    @Test void skillUsageCannotBecomeNegative() {
        Skill skill = new Skill("Java"); skill.setUsersCount(0);
        assertThrows(ConflictException.class, () -> skillService.decrementUsers(skill));
        assertThrows(BadRequestException.class, () -> skillService.incrementUsers(null));
    }

    @Mock TeamRepo teamRepo;
    @Mock ProjectService projectService;
    TeamService teamService;

    @Test void teamAddMemberUpdatesCountAndRejectsFullOrDuplicate() {
        Project project = project("p1", 3, 1); when(projectService.findById("p1")).thenReturn(project);
        when(teamRepo.existsByProjectIdAndUserId("p1", "u2")).thenReturn(false);
        teamService.addMember("p1", "u2");
        assertEquals(2, project.getCurrentTeamSize()); verify(teamRepo).addMember("p1", "u2");
        project.setCurrentTeamSize(3);
        assertThrows(TeamFullException.class, () -> teamService.addMember("p1", "u3"));
        project.setCurrentTeamSize(1); when(teamRepo.existsByProjectIdAndUserId("p1", "u2")).thenReturn(true);
        assertThrows(AlreadyProjectMemberException.class, () -> teamService.addMember("p1", "u2"));
    }

    @Test void teamLeaveRejectsLeadAndRemovesMember() {
        Project project = project("p1", 4, 2); when(projectService.findById("p1")).thenReturn(project);
        when(projectService.isProjectLead("p1", "lead")).thenReturn(true);
        assertThrows(ProjectLeadCannotLeaveException.class, () -> teamService.leaveProject("p1", "lead"));
        when(projectService.isProjectLead("p1", "member")).thenReturn(false);
        when(teamRepo.existsByProjectIdAndUserId("p1", "member")).thenReturn(true);
        teamService.leaveProject("p1", "member");
        assertEquals(1, project.getCurrentTeamSize()); verify(teamRepo).removeMember("p1", "member");
    }

    @Mock TaskRepository taskRepository;
    @Mock TeamRepo taskTeamRepo;
    @Mock UserService taskUserService;
    @Mock ProjectService taskProjectService;
    TaskService taskService;

    @Test void taskCreationRequiresMemberAndSetsTodo() {
        Project project = project("p1", 4, 1); User creator = user("u1"); project.setTeam(null);
        when(taskProjectService.findById("p1")).thenReturn(project);
        when(taskTeamRepo.existsByProjectIdAndUserId("p1", "u1")).thenReturn(true);
        when(taskUserService.findById("u1")).thenReturn(creator);
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));
        CreateTask request = new CreateTask("Build API", "desc", null, TaskPriority.HIGH, null, 4);
        Task task = taskService.createTask("p1", request, "u1");
        assertEquals(TaskStatus.TODO, task.getStatus()); assertSame(project, task.getProject()); assertEquals(TaskPriority.HIGH, task.getPriority());
        assertThrows(BadRequestException.class, () -> taskService.createTask("p1", null, "u1"));
    }

    @Test void taskCreationRejectsNonMemberAndForeignAssignee() {
        Project project = project("p1", 4, 1); when(taskProjectService.findById("p1")).thenReturn(project);
        when(taskTeamRepo.existsByProjectIdAndUserId("p1", "outsider")).thenReturn(false);
        assertThrows(ForbiddenException.class, () -> taskService.createTask("p1", new CreateTask("Task", null, null, null, null, null), "outsider"));
        when(taskTeamRepo.existsByProjectIdAndUserId("p1", "member")).thenReturn(true);
        when(taskUserService.findById("member")).thenReturn(user("member"));
        when(taskTeamRepo.existsByProjectIdAndUserId("p1", "foreign")).thenReturn(false);
        CreateTask request = new CreateTask("Task", null, "foreign", null, null, null);
        assertThrows(TaskAssigneeNotProjectMemberException.class, () -> taskService.createTask("p1", request, "member"));
    }

    @Mock ChatMessageRepository chatRepository;
    @Mock ProjectService chatProjectService;
    @Mock UserService chatUserService;
    ChatService chatService;

    @Test void chatTrimsMessageAndRequiresMembership() {
        Project project = project("p1", 3, 1); User sender = user("u1");
        when(chatProjectService.findById("p1")).thenReturn(project); when(chatProjectService.isProjectMember("p1", "u1")).thenReturn(true); when(chatUserService.findById("u1")).thenReturn(sender); when(chatRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        ChatMessage saved = chatService.sendMessage("p1", "u1", " hello ");
        assertEquals("hello", saved.getMessage());
        assertThrows(BadRequestException.class, () -> chatService.sendMessage("p1", "u1", "  "));
        when(chatProjectService.isProjectMember("p1", "u2")).thenReturn(false);
        assertThrows(ForbiddenException.class, () -> chatService.sendMessage("p1", "u2", "hello"));
    }

    @Mock EventRepository eventRepository;
    @Mock ProjectService eventProjectService;
    EventService eventService;

    @Test void eventRecentLimitAndNotFoundBehavior() {
        assertEquals(List.of(), eventService.getRecentEvents(0)); verifyNoInteractions(eventRepository);
        when(eventRepository.findTop10ByOrderByStartDateDesc()).thenReturn(List.of()); assertTrue(eventService.getRecentEvents(10).isEmpty());
        when(eventRepository.findById(9L)).thenReturn(Optional.empty()); assertThrows(ResourceNotFoundException.class, () -> eventService.getEvent(9L));
    }

    @Mock ProjectRoleRepository roleRepository;
    @Mock InvitationsAndRequestsRepository requestsRepository;
    ProjectRoleService roleService;

    @Test void rolesNormalizeNamesAndValidateCapacity() {
        Project project = project("p1", 3, 0); ProjectRoleRequest request = new ProjectRoleRequest(); request.setName("  Backend   Engineer ");
        roleService.createRoles(project, List.of(request));
        assertTrue(project.getRequiredRoles().stream().anyMatch(r -> r.getName().equals("Backend Engineer")));
        ProjectRoleRequest duplicate = new ProjectRoleRequest(); duplicate.setName("backend engineer");
        assertThrows(DuplicateProjectRoleNameException.class, () -> roleService.createRoles(project("p2", 4, 0), List.of(request, duplicate)));
        Project overCapacity = project("p3", 2, 0); overCapacity.setRequiredRoles(new ArrayList<>(project.getRequiredRoles()));
        assertThrows(ProjectRoleCapacityExceededException.class, () -> roleService.validateTeamCapacity(overCapacity));
    }

    @Test void requiredRoleSelectionDistinguishesOpenAndMissing() {
        when(roleRepository.findAllByProjectId("p1")).thenReturn(List.of()); assertNull(roleService.requireOpenRole("p1", null));
        ProjectRole role = new ProjectRole(); role.setId(4L); role.setFilled(false);
        when(roleRepository.findAllByProjectId("p1")).thenReturn(List.of(role));
        assertThrows(RoleSelectionRequiredException.class, () -> roleService.requireOpenRole("p1", null));
        when(roleRepository.findByIdAndProjectIdForUpdate(4L, "p1")).thenReturn(Optional.of(role)); assertSame(role, roleService.requireOpenRole("p1", 4L));
    }

    @Mock MeetingRoomRepository roomRepository;
    @Mock NoteRepository noteRepository;
    @Mock UserRepository meetingUserRepository;
    @Mock ProjectService meetingProjectService;
    @Mock TeamService meetingTeamService;
    MeetingRoomService meetingRoomService;

    @Test void meetingRoomCreationIsLeadOnly() {
        Project project = project("p1", 3, 1); when(meetingProjectService.findById("p1")).thenReturn(project); when(meetingTeamService.isLead("p1", "lead")).thenReturn(true); when(roomRepository.save(any(MeetingRoom.class))).thenAnswer(i -> i.getArgument(0));
        MeetingRoom room = meetingRoomService.createMeetingRoom("p1", new CreateMeetingRoom("Planning", "Weekly", "Eng"), "lead");
        assertEquals("Planning", room.getName()); assertSame(project, room.getProject());
        when(meetingTeamService.isLead("p1", "member")).thenReturn(false); assertThrows(ForbiddenException.class, () -> meetingRoomService.createMeetingRoom("p1", new CreateMeetingRoom("x", null, null), "member"));
    }

    @Mock S3Client s3Client;
    @Mock UserService fileUserService;
    FileStorageService fileStorageService;

    @BeforeEach
    void initializeServices() {
        authService = new AuthService();
        ReflectionTestUtils.setField(authService, "authenticationManager", authenticationManager);
        ReflectionTestUtils.setField(authService, "userRepository", userRepository);
        ReflectionTestUtils.setField(authService, "passwordEncoder", passwordEncoder);
        ReflectionTestUtils.setField(authService, "tokenProvider", tokenProvider);
        ReflectionTestUtils.setField(authService, "collegeService", collegeService);
        userService = new UserService();
        ReflectionTestUtils.setField(userService, "userRepository", userRepo);
        skillService = new SkillService();
        ReflectionTestUtils.setField(skillService, "skillRepository", skillRepository);
        teamService = new TeamService();
        ReflectionTestUtils.setField(teamService, "teamRepo", teamRepo);
        ReflectionTestUtils.setField(teamService, "projectService", projectService);
        taskService = new TaskService();
        ReflectionTestUtils.setField(taskService, "taskRepository", taskRepository);
        ReflectionTestUtils.setField(taskService, "teamRepo", taskTeamRepo);
        ReflectionTestUtils.setField(taskService, "userService", taskUserService);
        ReflectionTestUtils.setField(taskService, "projectService", taskProjectService);
        chatService = new ChatService();
        ReflectionTestUtils.setField(chatService, "chatMessageRepository", chatRepository);
        ReflectionTestUtils.setField(chatService, "projectService", chatProjectService);
        ReflectionTestUtils.setField(chatService, "userService", chatUserService);
        eventService = new EventService();
        ReflectionTestUtils.setField(eventService, "EventReopsitory", eventRepository);
        ReflectionTestUtils.setField(eventService, "projectService", eventProjectService);
        roleService = new ProjectRoleService(roleRepository, requestsRepository);
        meetingRoomService = new MeetingRoomService(roomRepository, noteRepository, meetingUserRepository, meetingProjectService, meetingTeamService);
        fileStorageService = new FileStorageService(s3Client, fileUserService);
    }

    @Test void fileStorageRejectsMissingOversizedAndNonImageFiles() {
        assertThrows(BadRequestException.class, () -> fileStorageService.updateProfilePhoto(null, "u1"));
        MockMultipartFile text = new MockMultipartFile("file", "a.txt", "text/plain", new byte[]{1});
        assertThrows(BadRequestException.class, () -> fileStorageService.updateProfilePhoto(text, "u1"));
        MockMultipartFile large = new MockMultipartFile("file", "a.png", "image/png", new byte[5 * 1024 * 1024 + 1]);
        assertThrows(PayloadTooLargeException.class, () -> fileStorageService.updateProfilePhoto(large, "u1"));
        verifyNoInteractions(s3Client, fileUserService);
    }

    private static User user(String id) { User u = new User(); u.setId(id); u.setFirstName("Test"); u.setLastName("User"); return u; }
    private static Project project(String id, int max, int current) { Project p = new Project(); p.setId(id); p.setMaxTeamSize(max); p.setCurrentTeamSize(current); p.setStatus(ProjectStatus.RECRUITING); return p; }
}
