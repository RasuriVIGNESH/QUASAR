package com.ADP.peerConnect.service.Impl;

import com.ADP.peerConnect.exception.*;
import com.ADP.peerConnect.model.dto.request.Project.CreateTaskRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateTaskRequest;
import com.ADP.peerConnect.model.entity.*;
import com.ADP.peerConnect.model.entity.Project;
import com.ADP.peerConnect.model.entity.User;
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

/**
 * Service class for Task operations
 */
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
     * Create a new task
     */
    public Task createTask(String projectId, CreateTaskRequest request, String creatorId) {
        // Validate project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Check if user is project member
        // Allow project members or the project lead to create tasks
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(projectId, creatorId);
        boolean isLead = project.getLead() != null && project.getLead().getId().equals(creatorId);
        if (!isMember && !isLead) {
            throw new UnauthorizedException("Only project members or the project lead can create tasks");
        }

        User creator = userService.findById(creatorId);
        User assignee = null;

        // Validate assignee if provided
        if (request.getAssignedToId() != null) {
            assignee = userService.findById(request.getAssignedToId());

            // Check if assignee is project member
            if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, request.getAssignedToId())) {
                throw new BadRequestException("Cannot assign task to non-project member");
            }
        }

        // Create task
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

        // Check if user can update task (creator, assignee, or project Lead)
        boolean canUpdate = task.getCreatedBy().getId().equals(userId) ||
                (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId)) ||
                task.getProject().getLead().getId().equals(userId);

        if (!canUpdate) {
            throw new UnauthorizedException("Cannot update this task");
        }

        // Update fields if provided
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(request.getEstimatedHours());
        }
        if (request.getActualHours() != null) {
            task.setActualHours(request.getActualHours());
        }

        // Update assignee if provided
        if (request.getAssignedToId() != null) {
            if (request.getAssignedToId().isEmpty()) {
                task.setAssignedTo(null);
            } else {
                User assignee = userService.findById(request.getAssignedToId());

                // Check if assignee is project member
                if (!projectMemberRepository.existsByProjectIdAndUserId(
                        task.getProject().getId(), request.getAssignedToId())) {
                    throw new BadRequestException("Cannot assign task to non-project member");
                }

                task.setAssignedTo(assignee);
            }
        }

        return taskRepository.save(task);
    }

    /**
     * Delete task
     */
    public void deleteTask(Long taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // Check if user can delete task (creator or project Lead)
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

        // Check if user can update task status
        boolean canUpdate = task.getCreatedBy().getId().equals(userId) ||
                (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId)) ||
                task.getProject().getLead().getId().equals(userId);

        if (!canUpdate) {
            throw new UnauthorizedException("Cannot update task status");
        }

        User user = userService.findById(userId);

        if (completed) {
            task.complete(user);
        } else {
            task.setStatus(TaskStatus.TODO);
            task.setCompletedAt(null);
            task.setCompletedBy(null);
        }

        return taskRepository.save(task);
    }

    /**
     * Get project tasks
     */
    public List<Task> getProjectTasks(String projectId) {
        return taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId);
    }

    /**
     * Get project tasks with pagination
     */
    public Page<Task> getProjectTasks(String projectId, Pageable pageable) {
        return taskRepository.findByProjectIdOrderByCreatedAtAsc(projectId, pageable);
    }

    /**
     * Get tasks by assignee
     */
    public List<Task> getTasksByAssignee(String assigneeId) {
        return taskRepository.findByAssignedToIdOrderByCreatedAtAsc(assigneeId);
    }

    /**
     * Get tasks by status
     */
    public List<Task> getTasksByStatus(String projectId, TaskStatus status) {
        return taskRepository.findByProjectIdAndStatusOrderByCreatedAtAsc(projectId, status);
    }

    /**
     * Get overdue tasks
     */
    public List<Task> getOverdueTasks(String projectId) {
        return taskRepository.findOverdueTasksByProject(projectId);
    }

    /**
     * Get tasks due today
     */
    public List<Task> getTasksDueToday(String projectId) {
        return taskRepository.findTasksDueTodayByProject(projectId);
    }

    /**
     * Get tasks due within days
     */
    public List<Task> getTasksDueWithinDays(String projectId, int days) {
        LocalDate endDate = LocalDate.now().plusDays(days);
        return taskRepository.findTasksDueWithinDays(projectId, endDate);
    }

    /**
     * Search tasks by title
     */
    public List<Task> searchTasks(String projectId, String query) {
        return taskRepository.searchTasksByTitle(projectId, query);
    }

    /**
     * Get tasks by filters
     */
    public List<Task> getTasksByFilters(String projectId, TaskStatus status,
                                        TaskPriority priority, String assignedToId) {
        return taskRepository.findTasksByFilters(projectId, status, priority, assignedToId);
    }

    /**
     * Get task statistics
     */
    public TaskStatistics getTaskStatistics(String projectId) {
        long totalTasks = taskRepository.countByProjectId(projectId);
        long completedTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.COMPLETED);
        long inProgressTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.IN_PROGRESS);
        long todoTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.TODO);

        List<Task> overdueTasks = getOverdueTasks(projectId);
        List<Task> dueTodayTasks = getTasksDueToday(projectId);

        return new TaskStatistics(totalTasks, completedTasks, inProgressTasks,
                todoTasks, overdueTasks.size(), dueTodayTasks.size());
    }

    /**
     * Assign task to user
     */
    public Task assignTask(Long taskId, String assigneeId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // Check if user can assign task (creator or project Lead)
        boolean canAssign = task.getCreatedBy().getId().equals(userId) ||
                task.getProject().getLead().getId().equals(userId);

        if (!canAssign) {
            throw new UnauthorizedException("Cannot assign this task");
        }

        User assignee = userService.findById(assigneeId);

        // Check if assignee is project member
        if (!projectMemberRepository.existsByProjectIdAndUserId(
                task.getProject().getId(), assigneeId)) {
            throw new BadRequestException("Cannot assign task to non-project member");
        }

        task.setAssignedTo(assignee);
        return taskRepository.save(task);
    }

    /**
     * Unassign task
     */
    public Task unassignTask(Long taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // Check if user can unassign task
        boolean canUnassign = task.getCreatedBy().getId().equals(userId) ||
                task.getProject().getLead().getId().equals(userId) ||
                (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(userId));

        if (!canUnassign) {
            throw new UnauthorizedException("Cannot unassign this task");
        }

        task.setAssignedTo(null);
        return taskRepository.save(task);
    }

    /**
     * Inner class for task statistics
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

        // Getters
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