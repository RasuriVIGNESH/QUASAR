package com.ADP.peerConnect.service;

import com.ADP.peerConnect.model.entity.InvitationsAndRequests;
import com.ADP.peerConnect.model.enums.NotificationEventType;
import com.ADP.peerConnect.model.enums.Status;
import com.ADP.peerConnect.repository.InvitationsAndRequestsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CollaborationRequestLifecycleService {
    private final InvitationsAndRequestsRepository repository;
    private final InboxNotificationService notificationService;

    public CollaborationRequestLifecycleService(InvitationsAndRequestsRepository repository,
                                                 InboxNotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    public void expireOtherRequestsForRole(String projectId, Long roleId, Long acceptedRequestId,
                                           String actorId) {
        List<InvitationsAndRequests> pending = repository.findPendingByProjectAndRoleExcept(
                projectId, roleId, Status.PENDING, acceptedRequestId);
        expireAndNotify(pending, actorId, "A role on project ",
                " was filled before this collaboration request was resolved.");
    }

    public void expireOtherRequestsForProject(String projectId, Long acceptedRequestId, String actorId) {
        List<InvitationsAndRequests> pending = repository.findPendingByProjectExcept(
                projectId, Status.PENDING, acceptedRequestId);
        expireAndNotify(pending, actorId, "The project ", " is no longer recruiting.");
    }

    private void expireAndNotify(List<InvitationsAndRequests> pending, String actorId,
                                 String prefix, String suffix) {
        for (InvitationsAndRequests request : pending) {
            if (!request.isPending()) continue;
            request.expire();
            String projectTitle = request.getProject().getTitle();
            String text = prefix + projectTitle + suffix;
            notificationService.create(request.getTargetUser().getId(),
                    NotificationEventType.REQUEST_DECISION,
                    "Collaboration request expired", text,
                    request.getProject().getId(), actorId);
        }
    }
}
