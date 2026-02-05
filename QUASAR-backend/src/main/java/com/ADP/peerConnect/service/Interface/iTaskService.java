package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.request.Project.CreateTaskRequest;
import com.ADP.peerConnect.model.dto.request.Project.UpdateTaskRequest;
import com.ADP.peerConnect.model.entity.Task;
import com.ADP.peerConnect.model.enums.TaskPriority;
import com.ADP.peerConnect.model.enums.TaskStatus;
import com.ADP.peerConnect.service.Impl.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface iTaskService {

    public Task createTask(String projectId, CreateTaskRequest request, String creatorId);
    public Task updateTask(Long taskId, UpdateTaskRequest request, String userId) ;
    public void deleteTask(Long taskId, String userId) ;
    public Task toggleTaskCompletion(Long taskId, boolean completed, String userId);
    public List<Task> getProjectTasks(String projectId) ;
    public List<Task> getOverdueTasks(String projectId) ;
    public List<Task> getTasksDueToday(String projectId);


    public List<Task> getTasksDueWithinDays(String projectId, int days);
    public List<Task> searchTasks(String projectId, String query) ;
    public List<Task> getTasksByFilters(String projectId, TaskStatus status, TaskPriority priority, String assignedToId);
    public TaskService.TaskStatistics getTaskStatistics(String projectId) ;
    public Task assignTask(Long taskId, String assigneeId, String userId);
    public Task unassignTask(Long taskId, String userId);
    public Page<Task> getProjectTasks(String projectId, Pageable pageable) ;
    public List<Task> getTasksByAssignee(String assigneeId);
    public List<Task> getTasksByStatus(String projectId, TaskStatus status);
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
