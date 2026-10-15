package com.ADP.peerConnect.model.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record PortfolioEntryRequest(@NotBlank @Size(max=160) String title, @NotBlank @Size(max=2048) String url, @Size(max=2000) String description) {}
