import apiService from './api.js';

class PortfolioService {
  async list(projectId) {
    if (!projectId) throw new Error('Project ID is required');
    return apiService.get(`/projects/${projectId}/portfolio`, {}, { skipCache: true });
  }

  async create(projectId, entry) {
    if (!projectId) throw new Error('Project ID is required');
    return apiService.post(`/projects/${projectId}/portfolio`, entry);
  }

  async update(projectId, entryId, entry) {
    if (!projectId || !entryId) throw new Error('Project ID and entry ID are required');
    return apiService.put(`/projects/${projectId}/portfolio/${entryId}`, entry);
  }

  async remove(projectId, entryId) {
    if (!projectId || !entryId) throw new Error('Project ID and entry ID are required');
    return apiService.delete(`/projects/${projectId}/portfolio/${entryId}`);
  }
}

export const portfolioService = new PortfolioService();
export default portfolioService;
