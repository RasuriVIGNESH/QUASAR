package com.ADP.peerConnect.model.dto.response;
import com.ADP.peerConnect.model.entity.RecommendationFeedback;
import com.ADP.peerConnect.model.enums.FeedbackAction;
import java.time.LocalDateTime;
public record RecommendationFeedbackResponse(Long id, String projectId, String candidateUserId, FeedbackAction action, LocalDateTime updatedAt) {
    public static RecommendationFeedbackResponse from(RecommendationFeedback f) { return new RecommendationFeedbackResponse(f.getId(), f.getProject().getId(), f.getCandidateUser()==null?null:f.getCandidateUser().getId(), f.getAction(), f.getUpdatedAt()); }
}
