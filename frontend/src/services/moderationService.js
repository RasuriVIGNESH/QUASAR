import apiService from './api.js';

class ModerationService {
  async createReport({ projectId, userId, reason, description }) {
    if (!!projectId === !!userId) throw new Error('Report exactly one project or user');
    if (!reason) throw new Error('Report reason is required');
    return apiService.post('/reports', { projectId, userId, reason, description });
  }

  async listReports(page = 0, size = 20, status) {
    return apiService.get('/admin/reports', { page, size, status }, { skipCache: true });
  }

  async updateReport(reportId, update) {
    if (!reportId) throw new Error('Report ID is required');
    return apiService.patch(`/admin/reports/${reportId}`, { status: update.status, note: update.note });
  }
}

export const moderationService = new ModerationService();
export default moderationService;
