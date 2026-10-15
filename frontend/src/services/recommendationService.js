import apiService from './api.js';

const unwrapPage = (response) => {
  const envelope = response?.data ?? response;
  return envelope?.data ?? envelope;
};

class RecommendationService {
  async getRecommendedProjects(page = 0, size = 20) {
    return apiService.get('/recommendations/projects', { page, size }, { skipCache: true });
  }

  async getRecommendedMembers(projectId, page = 0, size = 20) {
    if (!projectId) throw new Error('Project ID is required');
    return apiService.get(`/projects/${projectId}/recommended-members`, { page, size }, { skipCache: true });
  }

  async getSkillGaps(projectId) {
    if (!projectId) throw new Error('Project ID is required');
    return apiService.get(`/projects/${projectId}/skill-gaps`, {}, { skipCache: true });
  }

  async getDiscoveryProject(projectId) {
    if (!projectId) throw new Error('Project ID is required');
    return apiService.get(`/discovery/projects/${projectId}`, {}, { skipCache: true });
  }

  async saveProject(projectId) {
    return this.sendProjectFeedback(projectId, 'SAVED');
  }

  async dismissProject(projectId) {
    return this.sendProjectFeedback(projectId, 'DISMISSED');
  }

  async markProjectNotRelevant(projectId) {
    return this.sendProjectFeedback(projectId, 'NOT_RELEVANT');
  }

  async sendProjectFeedback(projectId, action) {
    if (!projectId || !action) throw new Error('Project ID and feedback action are required');
    return apiService.post(`/recommendation-feedback/projects/${projectId}`, { action });
  }

  async sendCandidateFeedback(projectId, candidateUserId, action) {
    if (!projectId || !candidateUserId || !action) throw new Error('Project, candidate, and feedback action are required');
    return apiService.post(`/recommendation-feedback/projects/${projectId}/candidates/${candidateUserId}`, { action });
  }

  async getSavedProjects(page = 0, size = 20) {
    return apiService.get('/recommendation-feedback/saved/projects', { page, size }, { skipCache: true });
  }

  async getSavedCandidates(projectId, page = 0, size = 20) {
    if (!projectId) throw new Error('Project ID is required');
    return apiService.get(`/recommendation-feedback/saved/projects/${projectId}/candidates`, { page, size }, { skipCache: true });
  }

  static page(response) {
    const body = unwrapPage(response);
    const content = Array.isArray(body) ? body : body?.content || [];
    return {
      ...body,
      content,
      totalPages: body?.totalPages ?? (content.length ? 1 : 0),
      totalElements: body?.totalElements ?? content.length,
      number: body?.number ?? body?.pageNumber ?? 0,
      size: body?.size ?? content.length,
      last: body?.last ?? true,
    };
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
