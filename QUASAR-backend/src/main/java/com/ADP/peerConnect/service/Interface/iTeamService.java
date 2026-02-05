package com.ADP.peerConnect.service.Interface;

import com.ADP.peerConnect.model.dto.response.Project.ProjectInvitationResponse;
import com.ADP.peerConnect.model.dto.response.Project.ProjectMemberResponse;
import com.ADP.peerConnect.model.entity.ProjectInvitation;
import com.ADP.peerConnect.model.entity.ProjectMember;
import com.ADP.peerConnect.model.enums.InvitationStatus;
import com.ADP.peerConnect.model.enums.ProjectRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


import java.util.List;


public interface iTeamService {
    public ProjectInvitation inviteUserToProject(String projectId, String invitedUserId,
                                                 ProjectRole role, String message, String invitedById);
    public ProjectInvitation respondToInvitation(Long invitationId, InvitationStatus response, String userId) ;
    public void removeMemberFromProject(String projectId, String memberId, String requesterId) ;
    public void leaveProject(String projectId, String userId) ;
    public ProjectMember updateMemberRole(String projectId, String memberId, ProjectRole newRole, String requesterId) ;
    public Page<ProjectInvitation> getProjectInvitations(String projectId, Pageable pageable);
    public Page<ProjectInvitation> getPendingInvitationsForUser(String userId, Pageable pageable) ;
    public void cancelInvitation(Long invitationId, String requesterId) ;
    public List<ProjectMemberResponse> getProjectMembers(String projectId, String currentUserId);


    public List<ProjectMember> getUserProjectMemberships(String userId) ;
    public Page<ProjectInvitationResponse> getUserInvitations(String userId, InvitationStatus status, Pageable pageable);
}
