package com.ADP.peerConnect.model.dto.request;
import com.ADP.peerConnect.model.enums.ReportReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record ReportRequest(String projectId, String userId, @NotNull ReportReason reason, @Size(max=2000) String description) {}
