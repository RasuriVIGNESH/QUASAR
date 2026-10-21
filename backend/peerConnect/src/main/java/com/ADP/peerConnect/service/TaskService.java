package com.ADP.peerConnect.service;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.dto.request.Project.CreateTask;
import com.ADP.peerConnect.model.dto.request.Project.UpdateTask;
import com.ADP.peerConnect.model.dto.response.Project.TaskResponse;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.enums.*;
import com.ADP.peerConnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TeamRepo teamRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectService projectService;
    private Task loadTask(Long taskId) {
        return taskRepository.findByIdWithAssociations(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }
    private Project loadProject(String projectId) {
        return projectService.findById(projectId);
    }
    private void validateUserCanBeAssigned(Project project, String userId) {
        boolean isLead = project.getTeam() != null && project.getTeam().getLead() != null
                && project.getTeam().getLead().getId().equals(userId);
        boolean isMember = teamRepo.existsByProjectIdAndUserId(project.getId(), userId);

        if (!isLead && !isMember) {
            throw new TaskAssigneeNotProjectMemberException();
        }
    }


    public Task createTask(String projectId, CreateTask request, String creatorId) {
        if (request == null) throw new BadRequestException("Task details are required.");
        Project project = loadProject(projectId);

        boolean isLead   = project.getTeam() != null && project.getTeam().getLead() != null
                && project.getTeam().getLead().getId().equals(creatorId);
        boolean isMember = teamRepo.existsByProjectIdAndUserId(projectId, creatorId);

        if (!isMember && !isLead) {
            throw new ForbiddenException("Only project members or the project lead can create tasks");
        }

        User creator  = userService.findById(creatorId);
        User assignee = null;

        if (request.getAssignedToId() != null && !request.getAssignedToId().isEmpty()) {
            validateUserCanBeAssigned(project, request.getAssignedToId());
            assignee = userService.findById(request.getAssignedToId());
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(project);
        task.setCreatedBy(creator);
        task.setAssignedTo(assignee);
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setStatus(TaskStatus.TODO);

        return taskRepository.save(task);
    }

    public Task updateTask(Long taskId, UpdateTask request, String userId) {
        if (request == null) throw new BadRequestException("Task update details are required.");
        Task task = loadTask(taskId);

        Project project = task.getProject();

        boolean isLead    = project.getTeam() != null && project.getTeam().getLead() != null
                && project.getTeam().getLead().getId().equals(userId);
        boolean isCreator = task.getCreatedBy().getId().equals(userId);
        boolean isAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId);

        if (!isLead && !isCreator && !isAssignee) {
            throw new ForbiddenException("Cannot update this task");
        }

        if (request.getTitle()          != null) task.setTitle(request.getTitle());
        if (request.getDescription()    != null) task.setDescription(request.getDescription());
        if (request.getStatus()         != null) task.setStatus(request.getStatus());
        if (request.getPriority()       != null) task.setPriority(request.getPriority());
        if (request.getDueDate()        != null) task.setDueDate(request.getDueDate());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getActualHours()    != null) task.setActualHours(request.getActualHours());

        if (request.getAssignedToId() != null) {
            if (request.getAssignedToId().isEmpty()) {
                task.setAssignedTo(null);
            } else {
                validateUserCanBeAssigned(project, request.getAssignedToId());
                task.setAssignedTo(userService.findById(request.getAssignedToId()));
            }
        }

        return taskRepository.save(task);
    }

    public Task assignTask(Long taskId, String assigneeId, String userId) {
        Task task = loadTask(taskId);

        Project project = task.getProject();

        boolean canAssign = task.getCreatedBy().getId().equals(userId)
                || (project.getTeam() != null && project.getTeam().getLead() != null
                && project.getTeam().getLead().getId().equals(userId));

        if (!canAssign) {
            throw new ForbiddenException("Cannot assign this task");
        }

        validateUserCanBeAssigned(project, assigneeId);

        task.setAssignedTo(userService.findById(assigneeId));
        return taskRepository.save(task);
    }

    public Task unassignTask(Long taskId, String userId) {
        Task task = loadTask(taskId);

        boolean canUnassign = task.getCreatedBy().getId().equals(userId)
                || (task.getProject().getTeam() != null && task.getProject().getTeam().getLead() != null
                && task.getProject().getTeam().getLead().getId().equals(userId))
                || (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId));

        if (!canUnassign) {
            throw new ForbiddenException("Cannot unassign this task");
        }

        task.setAssignedTo(null);
        return taskRepository.save(task);
    }

    public void deleteTask(Long taskId, String userId) {
        Task task = loadTask(taskId);

        boolean canDelete = task.getCreatedBy().getId().equals(userId)
                || (task.getProject().getTeam() != null && task.getProject().getTeam().getLead() != null
                && task.getProject().getTeam().getLead().getId().equals(userId));

        if (!canDelete) {
            throw new ForbiddenException("Cannot delete this task");
        }

        taskRepository.delete(task);
    }


    public Task toggleTaskCompletion(Long taskId, boolean completed, String userId) {
        Task task = loadTask(taskId);

        boolean canUpdate = task.getCreatedBy().getId().equals(userId)
                || (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId))
                || (task.getProject().getTeam() != null && task.getProject().getTeam().getLead() != null
                && task.getProject().getTeam().getLead().getId().equals(userId));

        if (!canUpdate) {
            throw new ForbiddenException("Cannot update task status");
        }

        if (completed) {
            task.complete(userService.findById(userId));
        } else {
            task.setStatus(TaskStatus.TODO);
            task.setCompletedAt(null);
            task.setCompletedBy(null);
        }

        return taskRepository.save(task);
    }


    @Transactional(readOnly = true)
    public Page<TaskResponse> getProjectTaskResponses(
            String projectId,
            Pageable pageable) {

        Page<Long> idPage =
                taskRepository.findIdsByProjectId(projectId, pageable);

        if (idPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Task> tasks =
                taskRepository.findByIdsWithAssociations(
                        idPage.getContent()
                );

        Map<Long, Task> taskMap = tasks.stream()
                .collect(Collectors.toMap(
                        Task::getId,
                        Function.identity(),
                        (first, second) -> first
                ));

        List<TaskResponse> responses =
                idPage.getContent()
                        .stream()
                        .map(taskMap::get)
                        .filter(Objects::nonNull)
                        .map(TaskResponse::new)
                        .toList();

        return new PageImpl<>(
                responses,
                pageable,
                idPage.getTotalElements()
        );
    }


    @Transactional(readOnly = true)
    public List<Task> getTasksByAssignee(String assigneeId) {
        return taskRepository.findByAssignedToIdWithAssociations(assigneeId);
    }


    @Transactional(readOnly = true)
    public List<Task> getTasksByStatus(String projectId, TaskStatus status) {
        return taskRepository.findByProjectIdAndStatusWithAssociations(projectId, status);
    }


    @Transactional(readOnly = true)
    public List<Task> getOverdueTasks(String projectId) {
        return taskRepository.findOverdueTasksByProjectWithAssociations(projectId);
    }


    @Transactional(readOnly = true)
    public List<Task> getTasksDueToday(String projectId) {
        return taskRepository.findTasksDueTodayByProjectWithAssociations(projectId);
    }


    @Transactional(readOnly = true)
    public List<Task> getTasksDueWithinDays(String projectId, int days) {
        return taskRepository.findTasksDueWithinDaysWithAssociations(
                projectId, LocalDate.now().plusDays(days));
    }

    @Transactional(readOnly = true)
    public List<Task> searchTasks(String projectId, String query) {
        return taskRepository.searchTasksByTitleWithAssociations(projectId, query);
    }

    @Transactional(readOnly = true)
    public List<Task> getTasksByFilters(String projectId, TaskStatus status,
                                        TaskPriority priority, String assignedToId) {
        return taskRepository.findTasksByFiltersWithAssociations(
                projectId, status, priority, assignedToId);
    }


    @Transactional(readOnly = true)
    public TaskStatistics getTaskStatistics(String projectId) {
        long total       = taskRepository.countByProjectId(projectId);
        long completed   = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.COMPLETED);
        long inProgress  = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.IN_PROGRESS);
        long todo        = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.TODO);
        long overdue     = getOverdueTasks(projectId).size();
        long dueToday    = getTasksDueToday(projectId).size();

        return new TaskStatistics(total, completed, inProgress, todo, overdue, dueToday);
    }

    public static class TaskStatistics {
        private final long totalTasks;
        private final long completedTasks;
        private final long inProgressTasks;
        private final long todoTasks;
        private final long overdueTasks;
        private final long dueTodayTasks;

        public TaskStatistics(long totalTasks, long completedTasks, long inProgressTasks,
                              long todoTasks, long overdueTasks, long dueTodayTasks) {
            this.totalTasks      = totalTasks;
            this.completedTasks  = completedTasks;
            this.inProgressTasks = inProgressTasks;
            this.todoTasks       = todoTasks;
            this.overdueTasks    = overdueTasks;
            this.dueTodayTasks   = dueTodayTasks;
        }

        public long   getTotalTasks()       { return totalTasks; }
        public long   getCompletedTasks()   { return completedTasks; }
        public long   getInProgressTasks()  { return inProgressTasks; }
        public long   getTodoTasks()        { return todoTasks; }
        public long   getOverdueTasks()     { return overdueTasks; }
        public long   getDueTodayTasks()    { return dueTodayTasks; }
        public double getCompletionPercentage() {
            return totalTasks == 0 ? 0 : (double) completedTasks / totalTasks * 100;
        }
    }
}