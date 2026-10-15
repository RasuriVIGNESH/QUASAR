import apiService from './api.js';

class DiscoveryService {
  async getTemplates() {
    return apiService.get('/project-templates', {}, { skipCache: true });
  }

  async getTemplate(key) {
    if (!key) throw new Error('Template key is required');
    return apiService.get(`/project-templates/${encodeURIComponent(key)}`, {}, { skipCache: true });
  }

  async getMentorMatches(limit = 20) {
    return apiService.get('/matching/mentors', { limit }, { skipCache: true });
  }

  async getEventMatches(limit = 20) {
    return apiService.get('/matching/events', { limit }, { skipCache: true });
  }

  static unwrap(response) {
    const envelope = response?.data ?? response;
    return envelope?.data ?? envelope;
  }
}

export const discoveryService = new DiscoveryService();
export default discoveryService;
