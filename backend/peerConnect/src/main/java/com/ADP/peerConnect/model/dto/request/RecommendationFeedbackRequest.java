package com.ADP.peerConnect.model.dto.request;
import com.ADP.peerConnect.model.enums.FeedbackAction;
import jakarta.validation.constraints.NotNull;
public record RecommendationFeedbackRequest(@NotNull FeedbackAction action) {}
