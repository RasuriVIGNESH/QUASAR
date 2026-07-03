import apiService from './api.js';

class JoinRequestService {

  // POST /api/projects/{projectId}/join-request
  async sendJoinRequest(projectId, message) {
    return apiService.post(`/projects/${projectId}/join-request`, message);
  }

  // GET /api/User/invitations-requests?status=PENDING
  // Used by RequestContext to populate sentJoinRequests
  async getMyJoinRequests(page = 0, size = 20) {
    return apiService.get('/User/invitations-requests', { page, size, status: 'PENDING' });
  }

  // GET /api/projects/{projectId}/invitations-requests
  // Used by RequestContext to populate receivedJoinRequests (lead view)
  async getProjectJoinRequests(projectId, page = 0, size = 20) {
    return apiService.get(`/projects/${projectId}/invitations-requests`, { page, size });
  }

  // GET /api/User/invitations-requests  (all statuses, for history)
  async getUserInvitationsAndRequests({
          status = 'PENDING',
          page = 0,
          size = 20
      } = {}) {
          return apiService.get('/User/invitations-requests', {
            page,
            size,
            status  
        });
    }

  // PUT /api/{requestId}/respond?response=ACCEPTED
  async acceptJoinRequest(requestId) {
    return apiService.put(`/${requestId}/respond`, null, { response: 'ACCEPTED' });
  }

  // PUT /api/{requestId}/respond?response=REJECTED
  async rejectJoinRequest(requestId) {
    return apiService.put(`/${requestId}/respond`, null, { response: 'REJECTED' });
  }
  async cancelInvitation(invitationId) {
    try {
      if (!invitationId) throw new Error('Invitation ID is required');
      return await apiService.put(`/projects/invitations/${invitationId}/cancel`, null);
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
      throw new Error(error.message || 'Failed to cancel invitation');
    }
  }

  // PUT /api/projects/invitations/{invitationId}/cancel
  async cancelJoinRequest(invitationId) {
    return apiService.put(`/projects/invitations/${invitationId}/cancel`, null);
  }

  // POST /api/{projectId}/Invite  — lead invites a user
  async inviteUser(projectId, invitedId, message = '') {
    return apiService.post(`/${projectId}/Invite`, { InvitedId: invitedId, message });
  }
}


export const joinRequestService = new JoinRequestService();
export default joinRequestService;