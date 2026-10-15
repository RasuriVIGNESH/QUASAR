package com.ADP.peerConnect.model.dto.response;
import com.ADP.peerConnect.model.entity.PortfolioEntry;
import java.time.LocalDateTime;
public record PortfolioEntryResponse(Long id, String projectId, String ownerId, String title, String url, String description, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static PortfolioEntryResponse from(PortfolioEntry e) { return new PortfolioEntryResponse(e.getId(),e.getProject().getId(),e.getOwner().getId(),e.getTitle(),e.getUrl(),e.getDescription(),e.getCreatedAt(),e.getUpdatedAt()); }
}
