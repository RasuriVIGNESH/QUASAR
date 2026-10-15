package com.ADP.peerConnect.repository;
import com.ADP.peerConnect.model.entity.RecommendationFeedback;
import com.ADP.peerConnect.model.enums.FeedbackAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface RecommendationFeedbackRepository extends JpaRepository<RecommendationFeedback, Long> {
    Optional<RecommendationFeedback> findByActorIdAndProjectIdAndCandidateUserIsNull(String actorId, String projectId);
    Optional<RecommendationFeedback> findByActorIdAndProjectIdAndCandidateUserId(String actorId, String projectId, String candidateUserId);
    @Query("SELECT f.project.id FROM RecommendationFeedback f WHERE f.actor.id = :actorId AND f.candidateUser IS NULL AND f.action IN :actions")
    List<String> findProjectIdsByActorIdAndCandidateUserIsNullAndActionIn(
            @Param("actorId") String actorId, @Param("actions") List<FeedbackAction> actions);
    @Query("SELECT f.candidateUser.id FROM RecommendationFeedback f WHERE f.actor.id = :actorId AND f.project.id = :projectId AND f.action IN :actions AND f.candidateUser IS NOT NULL")
    List<String> findCandidateUserIdsByActorIdAndProjectIdAndActionIn(
            @Param("actorId") String actorId, @Param("projectId") String projectId,
            @Param("actions") List<FeedbackAction> actions);
    Page<RecommendationFeedback> findByActorIdAndCandidateUserIsNullAndActionOrderByUpdatedAtDesc(
            String actorId, FeedbackAction action, Pageable pageable);
    Page<RecommendationFeedback> findByActorIdAndProjectIdAndActionOrderByUpdatedAtDesc(
            String actorId, String projectId, FeedbackAction action, Pageable pageable);
}
