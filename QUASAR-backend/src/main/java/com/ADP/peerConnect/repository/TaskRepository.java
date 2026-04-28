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
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.id = :id")
    Optional<Task> findByIdWithAssociations(@Param("id") Long id);

    @Query(value = "SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId " +
            "ORDER BY t.createdAt ASC",
            countQuery = "SELECT count(t) FROM Task t WHERE t.project.id = :projectId")
    Page<Task> findByProjectIdWithAssociations(@Param("projectId") String projectId, Pageable pageable);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId " +
            "ORDER BY t.createdAt ASC")
    List<Task> findByProjectIdWithAssociations(@Param("projectId") String projectId);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.assignedTo.id = :assignedToId " +
            "ORDER BY t.createdAt ASC")
    List<Task> findByAssignedToIdWithAssociations(@Param("assignedToId") String assignedToId);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId AND t.status = :status " +
            "ORDER BY t.createdAt ASC")
    List<Task> findByProjectIdAndStatusWithAssociations(@Param("projectId") String projectId,
                                                        @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate < CURRENT_DATE AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasksByProjectWithAssociations(@Param("projectId") String projectId);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate = CURRENT_DATE AND t.status != 'COMPLETED'")
    List<Task> findTasksDueTodayByProjectWithAssociations(@Param("projectId") String projectId);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId " +
            "AND t.dueDate BETWEEN CURRENT_DATE AND :endDate AND t.status != 'COMPLETED'")
    List<Task> findTasksDueWithinDaysWithAssociations(@Param("projectId") String projectId,
                                                      @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId " +
            "AND LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "ORDER BY t.createdAt ASC")
    List<Task> searchTasksByTitleWithAssociations(@Param("projectId") String projectId,
                                                  @Param("query") String query);

    @Query("SELECT t FROM Task t " +
            "JOIN FETCH t.project p " +
            "JOIN FETCH p.lead " +
            "LEFT JOIN FETCH t.assignedTo " +
            "JOIN FETCH t.createdBy " +
            "LEFT JOIN FETCH t.completedBy " +
            "WHERE t.project.id = :projectId " +
            "AND (:status IS NULL OR t.status = :status) " +
            "AND (:priority IS NULL OR t.priority = :priority) " +
            "AND (:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) " +
            "ORDER BY t.priority DESC, t.dueDate ASC")
    List<Task> findTasksByFiltersWithAssociations(@Param("projectId") String projectId,
                                                  @Param("status") TaskStatus status,
                                                  @Param("priority") TaskPriority priority,
                                                  @Param("assignedToId") String assignedToId);

    // -------------------------------------------------------------------------
    // Count / delete operations — these never load entities so no lazy issue
    // -------------------------------------------------------------------------

    long countByProjectIdAndStatus(String projectId, TaskStatus status);

    long countByProjectId(String projectId);

}