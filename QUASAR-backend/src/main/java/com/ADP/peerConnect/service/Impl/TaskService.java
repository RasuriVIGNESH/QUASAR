package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.dto.request.Project.CreateTaskRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateTaskRequest;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.enums.*;
import com.ADP.peerConnect.repository.*;
import com.ADP.peerConnect.service.Interface.iTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class TaskService implements iTaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private UserService userService;

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Load a Task with ALL associations already fetched so no lazy proxy is
     * touched outside this transaction.
     * Requires TaskRepository.findByIdWithAssociations (see doc Section 3).
     */
    private Task loadTask(Long taskId) {
        return taskRepository.findByIdWithAssociations(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    /**
     * Load a Project with its lead fetched so permission checks don't trigger
     * a lazy load on project.getLead().
     * Requires ProjectRepository.findByIdWithAssociations (see doc Section 2).
     */
    private Project loadProject(String projectId) {
        return projectRepository.findByIdWithAssociations(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    /**
     * Validate that a user can be assigned to a task (is the lead or a member).
     * project.getLead() is already loaded by loadProject() / loadTask(), so no
     * extra lazy hit here.
     */
    private void validateUserCanBeAssigned(Project project, String userId) {
        boolean isLead = project.getLead() != null && project.getLead().getId().equals(userId);
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(project.getId(), userId);

        if (!isLead && !isMember) {
            throw new BadRequestException("Cannot assign task to non-project member or non-lead user");
        }
    }

    // -------------------------------------------------------------------------
    // Write operations
    // -------------------------------------------------------------------------

    /**
     * Create a new task.
     * project.getLead() is accessed for the permission check, so we load the
     * project through the custom query that JOIN FETCHes the lead.
     */
    @Override
    public Task createTask(String projectId, CreateTaskRequest request, String creatorId) {
        Project project = loadProject(projectId);

        boolean isLead   = project.getLead() != null && project.getLead().getId().equals(creatorId);
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, creatorId);

        if (!isMember && !isLead) {
            throw new UnauthorizedException("Only project members or the project lead can create tasks");
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

    /**
     * Update a task.
     * loadTask() brings in project + project.lead + assignedTo + createdBy,
     * so all the permission checks below are safe.
     */
    @Override
    public Task updateTask(Long taskId, UpdateTaskRequest request, String userId) {
        Task task = loadTask(taskId);

        Project project = task.getProject();

        boolean isLead    = project.getLead().getId().equals(userId);
        boolean isCreator = task.getCreatedBy().getId().equals(userId);
        boolean isAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId);

        if (!isLead && !isCreator && !isAssignee) {
            throw new UnauthorizedException("Cannot update this task");
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

    /**
     * Assign a task to a user.
     */
    @Override
    public Task assignTask(Long taskId, String assigneeId, String userId) {
        Task task = loadTask(taskId);

        Project project = task.getProject();

        boolean canAssign = task.getCreatedBy().getId().equals(userId)
                || project.getLead().getId().equals(userId);

        if (!canAssign) {
            throw new UnauthorizedException("Cannot assign this task");
        }

        validateUserCanBeAssigned(project, assigneeId);

        task.setAssignedTo(userService.findById(assigneeId));
        return taskRepository.save(task);
    }

    /**
     * Unassign a task.
     */
    @Override
    public Task unassignTask(Long taskId, String userId) {
        Task task = loadTask(taskId);

        boolean canUnassign = task.getCreatedBy().getId().equals(userId)
                || task.getProject().getLead().getId().equals(userId)
                || (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId));

        if (!canUnassign) {
            throw new UnauthorizedException("Cannot unassign this task");
        }

        task.setAssignedTo(null);
        return taskRepository.save(task);
    }

    /**
     * Delete a task.
     */
    @Override
    public void deleteTask(Long taskId, String userId) {
        Task task = loadTask(taskId);

        boolean canDelete = task.getCreatedBy().getId().equals(userId)
                || task.getProject().getLead().getId().equals(userId);

        if (!canDelete) {
            throw new UnauthorizedException("Cannot delete this task");
        }

        taskRepository.delete(task);
    }

    /**
     * Toggle task completion on / off.
     */
    @Override
    public Task toggleTaskCompletion(Long taskId, boolean completed, String userId) {
        Task task = loadTask(taskId);

        boolean canUpdate = task.getCreatedBy().getId().equals(userId)
                || (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId))
                || task.getProject().getLead().getId().equals(userId);

        if (!canUpdate) {
            throw new UnauthorizedException("Cannot update task status");
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

    // -------------------------------------------------------------------------
    // Read operations  — all @Transactional(readOnly = true)
    // -------------------------------------------------------------------------

    /**
     * Paginated list of tasks for a project.
     * Uses findByProjectIdWithAssociations so TaskResponse can safely access
     * task.getProject().getId(), task.getCreatedBy(), task.getAssignedTo().
     */
    @Override
    @Transactional(readOnly = true)
    public Page<Task> getProjectTasks(String projectId, Pageable pageable) {
        return taskRepository.findByProjectIdWithAssociations(projectId, pageable);
    }

    /**
     * All tasks assigned to a specific user (with associations fetched).
     */
    @Override
    @Transactional(readOnly = true)
    public List<Task> getTasksByAssignee(String assigneeId) {
        return taskRepository.findByAssignedToIdWithAssociations(assigneeId);
    }

    /**
     * Tasks filtered by status for a project.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Task> getTasksByStatus(String projectId, TaskStatus status) {
        return taskRepository.findByProjectIdAndStatusWithAssociations(projectId, status);
    }

    /**
     * Overdue tasks for a project.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Task> getOverdueTasks(String projectId) {
        return taskRepository.findOverdueTasksByProjectWithAssociations(projectId);
    }

    /**
     * Tasks due today for a project.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Task> getTasksDueToday(String projectId) {
        return taskRepository.findTasksDueTodayByProjectWithAssociations(projectId);
    }

    /**
     * Tasks due within N days for a project.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Task> getTasksDueWithinDays(String projectId, int days) {
        return taskRepository.findTasksDueWithinDaysWithAssociations(
                projectId, LocalDate.now().plusDays(days));
    }

    /**
     * Full-text search on task titles.
     */
    @Override
    @Transactional(readOnly = true)
    public List<Task> searchTasks(String projectId, String query) {
        return taskRepository.searchTasksByTitleWithAssociations(projectId, query);
    }

    /**
     * Multi-filter query (status, priority, assignee).
     */
    @Override
    @Transactional(readOnly = true)
    public List<Task> getTasksByFilters(String projectId, TaskStatus status,
                                        TaskPriority priority, String assignedToId) {
        return taskRepository.findTasksByFiltersWithAssociations(
                projectId, status, priority, assignedToId);
    }

    /**
     * Aggregate statistics for a project's task board.
     * Counts use simple count queries (no entity loading) so no lazy issues.
     * getOverdueTasks / getTasksDueToday reuse the fetch queries above.
     */
    @Override
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

    // -------------------------------------------------------------------------
    // Statistics DTO (inner class, unchanged)
    // -------------------------------------------------------------------------

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