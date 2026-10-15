package com.ADP.peerConnect.repository;
import com.ADP.peerConnect.model.entity.PortfolioEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface PortfolioEntryRepository extends JpaRepository<PortfolioEntry, Long> {
    @Query("SELECT e FROM PortfolioEntry e JOIN FETCH e.project JOIN FETCH e.owner WHERE e.project.id = :projectId ORDER BY e.createdAt DESC")
    List<PortfolioEntry> findByProjectIdOrderByCreatedAtDesc(@Param("projectId") String projectId);
    @Query("SELECT e FROM PortfolioEntry e JOIN FETCH e.project JOIN FETCH e.owner WHERE e.id = :id AND e.owner.id = :ownerId AND e.project.id = :projectId")
    Optional<PortfolioEntry> findByIdAndOwnerIdAndProjectId(
            @Param("id") Long id,
            @Param("ownerId") String ownerId,
            @Param("projectId") String projectId);
}
