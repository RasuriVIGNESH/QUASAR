package com.ADP.peerConnect.service.Interface;


import com.ADP.peerConnect.model.entity.ProjectJoinRequest;
import java.util.List;

public interface iProjectJoinRequestService {
    public ProjectJoinRequest sendJoinRequest(String projectId, String userId, String message) ;
    public void acceptJoinRequest(Long requestId, String LeadId) ;
    public void rejectJoinRequest(Long requestId, String LeadId) ;
    public void cancelJoinRequest(Long requestId, String userId) ;
    public List<ProjectJoinRequest> getProjectJoinRequests(String projectId, String userId);
    public List<ProjectJoinRequest> getUserJoinRequests(String userId);
}
