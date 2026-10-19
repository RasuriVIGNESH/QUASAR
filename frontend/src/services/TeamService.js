import apiService from './api.js';

class TeamService {
  // ===== INVITATION MANAGEMENT =====


  async inviteUserToProject(projectId, invitedId, message = '', roleId) {
    try {
      if (!projectId) throw new Error('Project ID is required');
      if (invitedId && typeof invitedId === 'object') {
        const invitation = invitedId;
        invitedId = invitation.invitedId || invitation.InvitedId || invitation.userId;
        message = invitation.message || '';
        roleId = invitation.roleId;
      }
      if (!invitedId) throw new Error('User ID is required');

      return await apiService.post(`/${projectId}/Invite`, {
        InvitedId: invitedId,
        ...(roleId ? { roleId } : {}),
        message
      });
    } catch (error) {
      console.error('TeamService: Error inviting user:', error);
      throw new Error(error.message || 'Failed to invite user to project');
    }
  }

// Update project lead - matches TeamController endpoint PUT /projects/{projectId}/members/{memberId}
  async updateProjectLead(projectId, memberId) {
    try {
      if (!projectId || !memberId) {
        throw new Error('Project ID and Member ID are required');
      }

      console.log('TeamService: Updating project lead:', projectId, memberId);

      const response = await apiService.put(`/projects/${projectId}/members/${memberId}`);
      console.log('TeamService: Project lead updated:', response);
      return response;
    } catch (error) {
      console.error('TeamService: Error updating project lead:', error);
      throw new Error(error.message || 'Failed to update project lead');
    }
  }
  // Respond to invitation (accept/REJECTED) - matches TeamController endpoint
  async respondToInvitation(invitationId, response) {
    try {
      if (!invitationId) throw new Error('Invitation ID is required');
      if (!['ACCEPTED', 'REJECTED'].includes(response))
        throw new Error('Response must be ACCEPTED or REJECTED');

      return await apiService.put(`/${invitationId}/respond`, null, { response });
    } catch (error) {
      console.error('TeamService: Error responding to invitation:', error);
      throw new Error(error.message || 'Failed to respond to invitation');
    }
  }

  // Cancel invitation - matches TeamController endpoint
  async cancelInvitation(invitationId) {
    try {
      if (!invitationId) {
        throw new Error('Invitation ID is required');
      }

      console.log('TeamService: Cancelling invitation:', invitationId);
      const response = await apiService.put(`/projects/invitations/${invitationId}/cancel`);
      console.log('TeamService: Invitation cancelled:', response);
      return response;
    } catch (error) {
      console.error('TeamService: Error cancelling invitation:', error);
      throw new Error(error.message || 'Failed to cancel invitation');
    }
  }

  // Get project invitations with pagination - matches TeamController endpoint
  async getProjectInvitations(projectId, page = 0, size = 10) {
    try {
      if (!projectId) throw new Error('Project ID is required');
      return await apiService.get(
          `/projects/${projectId}/invitations-requests`,
          { page, size }
      );
    } catch (error) {
      console.error('TeamService: Error getting project invitations:', error);
      throw new Error(error.message || 'Failed to get project invitations');
    }
  }

  // Get user invitations with optional status filter - matches TeamController endpoint
  async getUserInvitations(status = 'PENDING', page = 0, size = 10) {
    try {
      return await apiService.get(
          '/User/invitations-requests',
          { page, size, status }
      );
    } catch (error) {
      console.error('TeamService: Error getting user invitations:', error);
      throw new Error(error.message || 'Failed to get user invitations');
    }
  }
  // Get pending invitations for current user - matches TeamController endpoint
  async getPendingInvitations(page = 0, size = 10) {
    try {
      return await apiService.get(
          '/User/invitations-requests',
          { page, size, status: 'PENDING' }
      );
    } catch (error) {
      console.error('TeamService: Error getting pending invitations:', error);
      throw new Error(error.message || 'Failed to get pending invitations');
    }
  }

  // ===== MEMBER MANAGEMENT =====

  // Get project members - matches TeamController endpoint
  async getProjectMembers(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('TeamService: Getting project members for:', projectId);

      // Note: TeamController uses /projects/projects/{projectId}/members
      const response = await apiService.get(`/projects/${projectId}/members`);
      console.log('TeamService: Project members retrieved:', response);
      return response;
    } catch (error) {
      console.error('TeamService: Error getting project members:', error);
      throw new Error(error.message || 'Failed to get project members');
    }
  }

  // Remove member from project - matches TeamController endpoint
  async removeMemberFromProject(projectId, memberId) {
    try {
      if (!projectId || !memberId) {
        throw new Error('Project ID and Member ID are required');
      }

      console.log('TeamService: Removing member from project:', projectId, memberId);

      // Note: TeamController uses /projects/projects/{projectId}/members/{memberId}
      const response = await apiService.delete(`/projects/${projectId}/members/${memberId}`);
      console.log('TeamService: Member removed:', response);
      return response;
    } catch (error) {
      console.error('TeamService: Error removing member:', error);
      throw new Error(error.message || 'Failed to remove member from project');
    }
  }

  // Leave project - matches TeamController endpoint
  async leaveProject(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('TeamService: Leaving project:', projectId);

      // Note: TeamController uses /projects/projects/{projectId}/leave
      const response = await apiService.post(`/projects/${projectId}/leave`);
      console.log('TeamService: Left project successfully:', response);
      return response;
    } catch (error) {
      console.error('TeamService: Error leaving project:', error);
      throw new Error(error.message || 'Failed to leave project');
    }
  }

  // ===== CONVENIENCE METHODS =====

  // Accept invitation (shorthand)
  async acceptInvitation(invitationId) {
    try {
      return await this.respondToInvitation(invitationId, 'ACCEPTED');
    } catch (error) {
      throw new Error(error.message || 'Failed to accept invitation');
    }
  }

  // Decline invitation (shorthand)
  async declineInvitation(invitationId) {
    try {
      return await this.respondToInvitation(invitationId, 'REJECTED');
    } catch (error) {
      throw new Error(error.message || 'Failed to REJECTED invitation');
    }
  }

  // ===== ADVANCED OPERATIONS =====

  // Get all invitations for a project (all pages)
  async getAllProjectInvitations(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('TeamService: Getting all invitations for project:', projectId);

      let allInvitations = [];
      let page = 0;
      let hasMore = true;
      const pageSize = 50;

      while (hasMore) {
        const response = await this.getProjectInvitations(projectId, page, pageSize);
        const invitations = response?.content || response?.data?.content || [];

        allInvitations = [...allInvitations, ...invitations];

        hasMore = !(response?.last ?? response?.data?.last) && invitations.length > 0;
        page++;

        // Safety check to prevent infinite loops
        if (page > 100) {
          console.warn('TeamService: Reached maximum page limit (100) while fetching invitations');
          break;
        }
      }

      return {
        success: true,
        data: allInvitations,
        total: allInvitations.length,
        message: 'All project invitations retrieved successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get all project invitations');
    }
  }

  // Bulk invitation operations
  async sendBulkInvitations(projectId, invitations) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!Array.isArray(invitations) || invitations.length === 0) {
        throw new Error('Invitations array is required');
      }

      console.log('TeamService: Sending bulk invitations:', projectId, invitations);

      const results = [];
      for (const invitation of invitations) {
        try {
          const result = await this.inviteUserToProject(projectId, invitation);
          results.push({
            invitation,
            success: true,
            result
          });
        } catch (error) {
          results.push({
            invitation,
            success: false,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      return {
        success: true,
        data: results,
        summary: {
          total: results.length,
          successful,
          failed
        },
        message: `Bulk invitation process completed. ${successful}/${results.length} successful.`
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to send bulk invitations');
    }
  }

  // Get invitation statistics for a project
  async getInvitationStats(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('TeamService: Getting invitation statistics for project:', projectId);

      const allInvitations = await this.getAllProjectInvitations(projectId);
      const invitationList = allInvitations.data || [];

      const stats = {
        total: invitationList.length,
        pending: invitationList.filter(inv => inv.status === 'PENDING').length,
        accepted: invitationList.filter(inv => inv.status === 'ACCEPTED').length,
        REJECTED: invitationList.filter(inv => inv.status === 'REJECTED').length,
        cancelled: invitationList.filter(inv => inv.status === 'CANCELLED').length
      };

      return {
        success: true,
        data: stats,
        message: 'Invitation statistics retrieved successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get invitation statistics');
    }
  }

  // Get team overview with members and pending invitations
  async getTeamOverview(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('TeamService: Getting team overview for project:', projectId);

      const [members, invitations, stats] = await Promise.all([
        this.getProjectMembers(projectId),
        this.getProjectInvitations(projectId, 0, 20), // Get recent invitations
        this.getInvitationStats(projectId)
      ]);

      const overview = {
        members: {
          list: members?.data || [],
          count: (members?.data || []).length
        },
        recentInvitations: {
          list: invitations?.data?.content || [],
          hasMore: !invitations?.data?.last
        },
        statistics: stats?.data || {},
        teamHealth: {
          memberCount: (members?.data || []).length,
          pendingInvitations: stats?.data?.pending || 0,
          responseRate: stats?.data?.total > 0
              ? Math.round(((stats?.data?.accepted + stats?.data?.REJECTED) / stats?.data?.total) * 100)
              : 0
        }
      };

      return {
        success: true,
        data: overview,
        message: 'Team overview retrieved successfully'
      };
    } catch (error) {
      console.error('TeamService: Error getting team overview:', error);
      throw new Error(error.message || 'Failed to get team overview');
    }
  }

  // Batch invitation responses
  async respondToBulkInvitations(invitationResponses) {
    try {
      if (!Array.isArray(invitationResponses) || invitationResponses.length === 0) {
        throw new Error('Invitation responses array is required');
      }

      console.log('TeamService: Processing bulk invitation responses...');

      const results = [];
      for (const invResponse of invitationResponses) {
        try {
          if (!invResponse.invitationId || !invResponse.response) {
            throw new Error('Invitation ID and response are required');
          }

          const result = await this.respondToInvitation(invResponse.invitationId, invResponse.response);
          results.push({
            invitationId: invResponse.invitationId,
            response: invResponse.response,
            success: true,
            result
          });
        } catch (error) {
          results.push({
            invitationId: invResponse.invitationId,
            response: invResponse.response,
            success: false,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success).length;

      return {
        success: true,
        data: results,
        summary: {
          total: results.length,
          successful,
          failed: results.length - successful
        },
        message: `Bulk response processing completed. ${successful}/${results.length} successful.`
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to process bulk invitation responses');
    }
  }

  // Get member role distribution
  async getMemberRoleDistribution(projectId) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      console.log('TeamService: Getting member role distribution for project:', projectId);

      const membersResponse = await this.getProjectMembers(projectId);
      const members = membersResponse?.data || [];

      const roleDistribution = members.reduce((acc, member) => {
        const role = member.role || 'MEMBER';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          distribution: roleDistribution,
          totalMembers: members.length,
          roles: Object.keys(roleDistribution)
        },
        message: 'Member role distribution retrieved successfully'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get member role distribution');
    }
  }

  // Find members by role
  async getMembersByRole(projectId, role) {
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      if (!role) {
        throw new Error('Role is required');
      }

      console.log('TeamService: Getting members by role:', projectId, role);

      const membersResponse = await this.getProjectMembers(projectId);
      const members = membersResponse?.data || [];

      const filteredMembers = members.filter(member =>
          (member.role || 'MEMBER').toUpperCase() === role.toUpperCase()
      );

      return {
        success: true,
        data: filteredMembers,
        count: filteredMembers.length,
        message: `Members with role ${role} retrieved successfully`
      };
    } catch (error) {
      throw new Error(error.message || `Failed to get members with role ${role}`);
    }
  }

  // Check if user is project member
  async isUserProjectMember(projectId, userId) {
    try {
      if (!projectId || !userId) {
        throw new Error('Project ID and User ID are required');
      }

      const membersResponse = await this.getProjectMembers(projectId);
      const members = membersResponse?.data || [];

      const isMember = members.some(member => member.user?.id === userId || member.userId === userId);

      return {
        success: true,
        data: {
          isMember,
          member: isMember ? members.find(m => m.user?.id === userId || m.userId === userId) : null
        },
        message: isMember ? 'User is a project member' : 'User is not a project member'
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to check membership status');
    }
  }

  // Get user's role in project
  async getUserRoleInProject(projectId, userId) {
    try {
      if (!projectId || !userId) {
        throw new Error('Project ID and User ID are required');
      }

      const membershipCheck = await this.isUserProjectMember(projectId, userId);

      if (!membershipCheck.data.isMember) {
        return {
          success: true,
          data: {
            hasRole: false,
            role: null
          },
          message: 'User is not a member of this project'
        };
      }

      const member = membershipCheck.data.member;

      return {
        success: true,
        data: {
          hasRole: true,
          role: member.role || 'MEMBER',
          member: member
        },
        message: `User role retrieved: ${member.role || 'MEMBER'}`
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to get user role in project');
    }
  }

  // Validate team operation permissions
  async validateTeamOperation(projectId, userId, operation) {
    try {
      if (!projectId || !userId || !operation) {
        throw new Error('Project ID, User ID, and operation are required');
      }

      const userRole = await this.getUserRoleInProject(projectId, userId);

      if (!userRole.data.hasRole) {
        return {
          success: false,
          allowed: false,
          reason: 'User is not a member of this project'
        };
      }

      const role = userRole.data.role;
      const permissions = {
        'invite': ['Lead', 'ADMIN'],
        'remove_member': ['Lead'],
        'update_role': ['Lead'],
        'cancel_invitation': ['Lead', 'ADMIN'],
        'view_invitations': ['Lead', 'ADMIN', 'MEMBER'],
        'view_members': ['Lead', 'ADMIN', 'MEMBER']
      };

      const allowedRoles = permissions[operation] || [];
      const isAllowed = allowedRoles.includes(role);

      return {
        success: true,
        allowed: isAllowed,
        userRole: role,
        requiredRoles: allowedRoles,
        reason: isAllowed ? 'Operation permitted' : `Operation requires one of: ${allowedRoles.join(', ')}`
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to validate team operation permissions');
    }
  }
}

export const teamService = new TeamService();
export default teamService;
