package com.ADP.peerConnect.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO that holds dashboard counts shown on frontend
 */
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class DashboardCountsResponse {
    private long projectsCount;
    private long skillsCount;
}

