import apiService from './api.js';

const unwrap = (response) => {
    let value = response;
    for (let index = 0; index < 4; index += 1) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) break;
        if (value.data && typeof value.data === 'object' && !Array.isArray(value.data)) {
            value = value.data;
            continue;
        }
        break;
    }
    return value ?? {};
};

const errorMessage = (error, fallback) => error?.data?.message || error?.message || fallback;

class SkillInsightsService {
    async getMyAnalysis() {
        try {
            const response = await apiService.get('/skills/analysis/me', {}, { skipCache: true });
            return unwrap(response);
        } catch (error) {
            throw new Error(errorMessage(error, 'Unable to load your skill insights'));
        }
    }

    async getProjectAnalysis(projectId) {
        if (!projectId) throw new Error('Project ID is required');
        try {
            const response = await apiService.get(`/projects/${projectId}/skills/analysis`, {}, { skipCache: true });
            return unwrap(response);
        } catch (error) {
            throw new Error(errorMessage(error, 'Unable to load team skill coverage'));
        }
    }

    async getDemand({ category = '', query = '', page = 0, size = 20 } = {}) {
        try {
            const params = { page, size };
            if (category) params.category = category;
            if (query?.trim()) params.q = query.trim();
            const response = await apiService.get('/skills/demand', params, { skipCache: true });
            return unwrap(response);
        } catch (error) {
            throw new Error(errorMessage(error, 'Unable to load platform skill demand'));
        }
    }
}

export const skillInsightsService = new SkillInsightsService();
export default skillInsightsService;
