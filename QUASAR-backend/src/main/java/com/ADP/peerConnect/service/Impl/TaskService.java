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

    /**
     * Helper method to validate if a user is allowed to be assigned a task.
     * Checks if the user is either the Project Lead or a Project Member.
     */
    private void validateUserCanBeAssigned(Project project, String userId) {
        boolean isLead = project.getLead() != null && project.getLead().getId().equals(userId);
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(project.getId(), userId);

        if (!isLead && !isMember) {
            throw new BadRequestException("Cannot assign task to non-project member or non-lead user");
        }
    }

    /**
     * Create a new task
     */
    public Task createTask(String projectId, CreateTaskRequest request, String creatorId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Permission check: Creator must be Lead or Member
        boolean isLead = project.getLead() != null && project.getLead().getId().equals(creatorId);
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, creatorId);

        if (!isMember && !isLead) {
            throw new UnauthorizedException("Only project members or the project lead can create tasks");
        }

        User creator = userService.findById(creatorId);
        User assignee = null;

        // Validation for assignee
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
     * Update task
     */
    public Task updateTask(Long taskId, UpdateTaskRequest request, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Project project = task.getProject();

        // Permission check: Lead, Creator, or Assignee
        boolean isLead = project.getLead().getId().equals(userId);
        boolean isCreator = task.getCreatedBy().getId().equals(userId);
        boolean isAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId);

        if (!isLead && !isCreator && !isAssignee) {
            throw new UnauthorizedException("Cannot update this task");
        }

        // Apply updates
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getActualHours() != null) task.setActualHours(request.getActualHours());

        // Assignee update with Lead-check fix
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
     * Assign task to user (Dedicated Endpoint Fix)
     */
    public Task assignTask(Long taskId, String assigneeId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Project project = task.getProject();

        // Check if requester has authority
        boolean canAssign = task.getCreatedBy().getId().equals(userId) || project.getLead().getId().equals(userId);
        if (!canAssign) {
            throw new UnauthorizedException("Cannot assign this task");
        }

        // Fix: Use helper to allow Lead to be assigned
        validateUserCanBeAssigned(project, assigneeId);

        task.setAssignedTo(userService.findById(assigneeId));
        return taskRepository.save(task);
    }

    /**
     * Delete task
     */
    public void deleteTask(Long taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        boolean canDelete = task.getCreatedBy().getId().equals(userId) ||
                task.getProject().getLead().getId().equals(userId);

        if (!canDelete) {
            throw new UnauthorizedException("Cannot delete this task");
        }

        taskRepository.delete(task);
    }

    /**
     * Toggle task completion
     */
    public Task toggleTaskCompletion(Long taskId, boolean completed, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        boolean canUpdate = task.getCreatedBy().getId().equals(userId) ||
                (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId)) ||
                task.getProject().getLead().getId().equals(userId);

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

    public Task unassignTask(Long taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        boolean canUnassign = task.getCreatedBy().getId().equals(userId) ||
                task.getProject().getLead().getId().equals(userId) ||
                (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId));

        if (!canUnassign) {
            throw new UnauthorizedException("Cannot unassign this task");
        }

        task.setAssignedTo(null);
        return taskRepository.save(task);
    }

    // --- READ OPERATIONS ---

    public Page<Task> getProjectTasks(String projectId, Pageable pageable) {
        return taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId, pageable);
    }

    public List<Task> getTasksByAssignee(String assigneeId) {
        return taskRepository.findByAssignedToIdOrderByCreatedAtAsc(assigneeId);
    }

    public List<Task> getTasksByStatus(String projectId, TaskStatus status) {
        return taskRepository.findByProjectIdAndStatusOrderByCreatedAtAsc(projectId, status);
    }

    public List<Task> getOverdueTasks(String projectId) {
        return taskRepository.findOverdueTasksByProject(projectId);
    }

    public List<Task> getTasksDueToday(String projectId) {
        return taskRepository.findTasksDueTodayByProject(projectId);
    }

    public List<Task> getTasksDueWithinDays(String projectId, int days) {
        return taskRepository.findTasksDueWithinDays(projectId, LocalDate.now().plusDays(days));
    }

    public List<Task> searchTasks(String projectId, String query) {
        return taskRepository.searchTasksByTitle(projectId, query);
    }

    public List<Task> getTasksByFilters(String projectId, TaskStatus status, TaskPriority priority, String assignedToId) {
        return taskRepository.findTasksByFilters(projectId, status, priority, assignedToId);
    }

    public TaskStatistics getTaskStatistics(String projectId) {
        long totalTasks = taskRepository.countByProjectId(projectId);
        long completedTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.COMPLETED);
        long inProgressTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.IN_PROGRESS);
        long todoTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.TODO);

        return new TaskStatistics(totalTasks, completedTasks, inProgressTasks, todoTasks,
                getOverdueTasks(projectId).size(), getTasksDueToday(projectId).size());
    }

    /**
     * Statistics DTO
     */
    public static class TaskStatistics {
        private final long totalTasks;
        private final long completedTasks;
        private final long inProgressTasks;
        private final long todoTasks;
        private final long overdueTasks;
        private final long dueTodayTasks;

        public TaskStatistics(long totalTasks, long completedTasks, long inProgressTasks,
                              long todoTasks, long overdueTasks, long dueTodayTasks) {
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.inProgressTasks = inProgressTasks;
            this.todoTasks = todoTasks;
            this.overdueTasks = overdueTasks;
            this.dueTodayTasks = dueTodayTasks;
        }

        public long getTotalTasks() { return totalTasks; }
        public long getCompletedTasks() { return completedTasks; }
        public long getInProgressTasks() { return inProgressTasks; }
        public long getTodoTasks() { return todoTasks; }
        public long getOverdueTasks() { return overdueTasks; }
        public long getDueTodayTasks() { return dueTodayTasks; }
        public double getCompletionPercentage() {
            return totalTasks == 0 ? 0 : (double) completedTasks / totalTasks * 100;
        }
    }
}