package com.ADP.peerConnect.repository;

import com.ADP.peerConnect.model.entity.Task;
import com.ADP.peerConnect.model.enums.TaskStatus;
import com.ADP.peerConnect.model.enums.TaskPriority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for Task entity
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Find tasks by project ID
    List<Task> findByProjectIdOrderByCreatedAtAsc(String projectId);

    // Find tasks by project ID with pagination
    Page<Task> findByProjectIdOrderByCreatedAtAsc(String projectId, Pageable pageable);

    // Find tasks by assignee
    List<Task> findByAssignedToIdOrderByCreatedAtAsc(String assignedToId);

    // Find tasks by creator
    List<Task> findByCreatedByIdOrderByCreatedAtAsc(String createdById);

    // Find tasks by status
    List<Task> findByProjectIdAndStatusOrderByCreatedAtAsc(String projectId, TaskStatus status);

    // Find tasks by priority
    List<Task> findByProjectIdAndPriorityOrderByDueDateAsc(String projectId, TaskPriority priority);

    // Find completed tasks
    List<Task> findByProjectIdAndStatusOrderByCompletedAtDesc(String projectId, TaskStatus status);

    // Find overdue tasks
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.dueDate < CURRENT_DATE AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasksByProject(@Param("projectId") String projectId);

    // Find tasks due today
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.dueDate = CURRENT_DATE AND t.status != 'COMPLETED'")
    List<Task> findTasksDueTodayByProject(@Param("projectId") String projectId);

    // Find tasks due within days
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.dueDate BETWEEN CURRENT_DATE AND :endDate AND t.status != 'COMPLETED'")
    List<Task> findTasksDueWithinDays(@Param("projectId") String projectId, @Param("endDate") LocalDate endDate);

    // Count tasks by status
    long countByProjectIdAndStatus(String projectId, TaskStatus status);

    // Count total tasks for project
    long countByProjectId(String projectId);

    // Find unassigned tasks
    List<Task> findByProjectIdAndAssignedToIsNullOrderByCreatedAtAsc(String projectId);

    // Find tasks assigned to user in project
    List<Task> findByProjectIdAndAssignedToIdOrderByCreatedAtAsc(String projectId, String userId);

    // Search tasks by title
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY t.createdAt ASC")
    List<Task> searchTasksByTitle(@Param("projectId") String projectId, @Param("query") String query);

    // Find tasks with multiple criteria
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) " +
            "ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findTasksByFilters(@Param("projectId") String projectId,
                                  @Param("status") TaskStatus status,
                                  @Param("priority") TaskPriority priority,
                                  @Param("assignedToId") String assignedToId);

    // Delete all tasks for a project
    void deleteByProjectId(String projectId);
}