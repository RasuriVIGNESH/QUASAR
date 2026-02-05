package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.entity.ProjectInvitation;
import com.ADP.peerConnect.model.enums.ProjectRole;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface iProjectInvitationService {
    public ProjectInvitation sendInvitation(String projectId, String invitedUserId,
                                            String message, ProjectRole role, String inviterId);
    public List<ProjectInvitation> getUserInvitations(String userId, Pageable pageable) ;



    public void acceptInvitation(Long invitationId, String userId) ;
    public void rejectInvitation(Long invitationId, String userId) ;
    public List<ProjectInvitation> getPendingInvitations(String userId, Pageable pageable) ;
    public void cancelInvitation(Long invitationId, String userId) ;
    public List<ProjectInvitation> getProjectInvitations(String projectId, String userId);
}
