package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.response.Project.ProjectJoinRequestResponse;
import com.ADP.peerConnect.model.entity.ProjectJoinRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface iProjectJoinRequestService {

    /**
     * FIX: Returns ProjectJoinRequestResponse (DTO) instead of ProjectJoinRequest
     * entity, so the mapping is done inside the @Transactional boundary.
     */
    ProjectJoinRequestResponse sendJoinRequest(String projectId, String userId, String message);

    void acceptJoinRequest(Long requestId, String leadId);

    void rejectJoinRequest(Long requestId, String leadId);

    void cancelJoinRequest(Long requestId, String userId);

    List<ProjectJoinRequest> getProjectJoinRequests(String projectId, String userId);

    List<ProjectJoinRequest> getUserJoinRequests(String userId);

    Page<ProjectJoinRequestResponse> getMyRequests(String id, Pageable pageable);
}