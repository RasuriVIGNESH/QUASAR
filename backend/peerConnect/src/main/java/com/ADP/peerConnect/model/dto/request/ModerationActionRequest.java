package com.ADP.peerConnect.model.dto.request;
import com.ADP.peerConnect.model.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record ModerationActionRequest(@NotNull ReportStatus status, @Size(max=2000) String note) {}
