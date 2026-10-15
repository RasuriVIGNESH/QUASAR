package com.ADP.peerConnect.model.dto.response;
import com.ADP.peerConnect.model.entity.PlatformReport;
import com.ADP.peerConnect.model.enums.*;
import java.time.LocalDateTime;
public record ReportResponse(Long id, String reporterId, String projectId, String userId, ReportReason reason, String description, ReportStatus status, String reviewedById, String moderationNote, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static ReportResponse from(PlatformReport r) { return new ReportResponse(r.getId(),r.getReporter().getId(),r.getReportedProject()==null?null:r.getReportedProject().getId(),r.getReportedUser()==null?null:r.getReportedUser().getId(),r.getReason(),r.getDescription(),r.getStatus(),r.getReviewedBy()==null?null:r.getReviewedBy().getId(),r.getModerationNote(),r.getCreatedAt(),r.getUpdatedAt()); }
}
