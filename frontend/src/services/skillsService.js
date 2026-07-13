import apiService from './api.js';

class SkillsService {
    constructor() {
        this.staticDataCacheTTL = 60000;   // 60s — predefined/categories rarely change
        this.userSkillsCacheTTL = 30000;   // 30s
        this.skillListCacheTTL = 30000;    // 30s
    }

    // GET /api/skills/predefined → Map<String,String> {skillName: category}
    // Returns: { data: [{name, category}, ...], success }
    async getPredefinedSkills() {
        try {
        const response = await apiService.get(
            '/skills/predefined',
            {},
            { cacheTTL: this.staticDataCacheTTL }
        );

        const rawData = response?.data || response || {};

        if (rawData && typeof rawData === 'object' && !Array.isArray(rawData)) {
            return {
            data: Object.entries(rawData).map(([name, category]) => ({ name, category })),
            success: true
            };
        }

        return { data: [], success: true };
        } catch (error) {
        console.error('SkillsService: Error getting predefined skills:', error);
        return { data: [], success: false };
        }
    }

    // GET /api/skills?page&size&sortBy&sortDir
    async getAllSkills(page = 0, size = 10, sortBy = 'name', sortDir = 'asc') {
        try {
        return await apiService.get(
            '/skills',
            { page, size, sortBy, sortDir },
            { cacheTTL: this.skillListCacheTTL }
        );
        } catch (error) {
        console.error('SkillsService: Error getting all skills:', error);
        throw error;
        }
    }

    // GET /api/skills/categories
    async getSkillCategories() {
        try {
        return await apiService.get(
            '/skills/categories',
            {},
            { cacheTTL: this.staticDataCacheTTL }
        );
        } catch (error) {
        console.error('SkillsService: Error getting skill categories:', error);
        throw error;
        }
    }

    // GET /api/skills/category/{category}
    async getSkillsByCategory(category, page = 0, size = 10) {
        try {
        if (!category) throw new Error('Category is required');
        return await apiService.get(
            `/skills/category/${category}`,
            { page, size },
            { cacheTTL: this.skillListCacheTTL }
        );
        } catch (error) {
        console.error('SkillsService: Error getting skills by category:', error);
        throw error;
        }
    }

    // GET /api/popularSkills — backend hardcodes page 0 size 10, no params needed
    async getPopularSkills() {
        try {
        return await apiService.get(
            '/popularSkills',
            {},
            { cacheTTL: this.skillListCacheTTL }
        );
        } catch (error) {
        console.error('SkillsService: Error getting popular skills:', error);
        throw error;
        }
    }

    // GET /api/skills/search?query&page&size
    async searchSkills(searchTerm, page = 0, size = 10) {
        try {
        if (!searchTerm || searchTerm.trim().length === 0)
            return { data: { content: [] } };

        return await apiService.get(
            '/skills/search',
            { query: searchTerm.trim(), page, size },
            { skipCache: true }
        );
        } catch (error) {
        console.error('SkillsService: Error searching skills:', error);
        throw error;
        }
    }

    // GET /api/skills/discovery/by-name/{name}
    async searchSkillsByName(name) {
        try {
        if (!name || name.trim().length === 0) throw new Error('Skill name is required');
        return await apiService.get(
            `/skills/discovery/by-name/${encodeURIComponent(name.trim())}`,
            {},
            { skipCache: true }
        );
        } catch (error) {
        console.error('SkillsService: Error searching skills by name:', error);
        throw error;
        }
    }

    // GET /api/skills/discovery/category/{category}
    async getSkillsByDiscoveryCategory(category) {
        try {
        if (!category) throw new Error('Category is required');
        return await apiService.get(
            `/skills/discovery/category/${category}`,
            {},
            { cacheTTL: this.skillListCacheTTL }
        );
        } catch (error) {
        console.error('SkillsService: Error getting skills by discovery category:', error);
        throw error;
        }
    }

    // GET /api/skills/discovery/categories
    async getDiscoveryCategories() {
        try {
        return await apiService.get(
            '/skills/discovery/categories',
            {},
            { cacheTTL: this.staticDataCacheTTL }
        );
        } catch (error) {
        console.error('SkillsService: Error getting discovery categories:', error);
        throw error;
        }
    }

    // GET /api/skills/discovery/search?query
    async searchSkillsDiscovery(query) {
        try {
        if (!query || query.trim().length === 0) throw new Error('Search query is required');
        return await apiService.get(
            '/skills/discovery/search',
            { query: query.trim() },
            { skipCache: true }
        );
        } catch (error) {
        console.error('SkillsService: Error searching skills discovery:', error);
        throw error;
        }
    }

    // GET /api/students/users/{userId}/skills → List<UserSkillResponse>
    // Returns: { data: [...], success }
    async getUserSkillsByUserId(userId) {
        try {
        if (!userId) throw new Error('User ID is required');

        const response = await apiService.get(
            `/students/users/${userId}/skills`,
            {},
            { cacheTTL: this.userSkillsCacheTTL }
        );

        // Backend returns List<UserSkillResponse> directly (no ApiResponse wrapper)
        const skillsData = Array.isArray(response) ? response : (response?.data || []);
        return {
            data: Array.isArray(skillsData) ? skillsData : [],
            success: true
        };
        } catch (error) {
        console.error('SkillsService: Error getting user skills:', error);
        return { data: [], success: false, error: error.message };
        }
    }

    // POST /api/skills
    // Body: AddUserSkillRequest { skillName, level, experience, category }
    async addUserSkill(skillData, currentUser) {
        try {
        if (!skillData.skillName) throw new Error('Skill name is required');

        const requestData = {
            skillName: skillData.skillName,
            category: skillData.category || '',
            level: skillData.level || 'BEGINNER',
            experience: String(skillData.experience || '0')
            // DO NOT send currentUser — backend resolves via @AuthenticationPrincipal
        };

        const response = await apiService.post('/skills', requestData);

        if (currentUser?.id)
            apiService.invalidateCache(`/students/users/${currentUser.id}/skills`);

        return response;
        } catch (error) {
        console.error('SkillsService: Error adding user skill:', error);
        throw error;
        }
    }

    // POST /api/skills/batch
    // Body: AddUserSkillsRequest { skills: [{ skillName, level, experience, category }] }
    async addBatchSkills(skillsList, currentUser) {
        try {
        if (!skillsList || skillsList.length === 0)
            throw new Error('At least one skill is required');

            const payload = skillsList.map(s => ({
                skillName: s.skillName || s.skill?.name || s.name,
                level: s.level || 'BEGINNER',
                experience: String(s.experience || '0'),
                category: s.category || s.skill?.category || ''
            }));

            const response = await apiService.post('/skills/batch', payload);

        if (currentUser?.id)
            apiService.invalidateCache(`/students/users/${currentUser.id}/skills`);

        return response;
        } catch (error) {
        console.error('SkillsService: Error adding batch skills:', error);
        throw error;
        }
    }

    // PUT /api/skills/{skillId}
    // Body: UpdateUserSkillRequest { level, experience } — name/category NOT updatable
    async updateUserSkill(skillId, skillData) {
        try {
        if (!skillId) throw new Error('Skill ID is required');

        const requestData = {
            level: skillData.level || 'BEGINNER',
            experience: skillData.experience || ''
            // DO NOT send name or category — backend ignores/rejects them
        };

        const response = await apiService.put(`/skills/${skillId}`, requestData);
        apiService.invalidateCache('/students/users');

        return response;
        } catch (error) {
        console.error('SkillsService: Error updating user skill:', error);
        throw error;
        }
    }

    // DELETE /api/skills/{skillId}
    async deleteUserSkill(skillId) {
        try {
        if (!skillId) throw new Error('Skill ID is required');

        const response = await apiService.delete(`/skills/${skillId}`);
        apiService.invalidateCache('/students/users');

        return response;
        } catch (error) {
        console.error('SkillsService: Error deleting user skill:', error);
        throw error;
        }
    }
}

export const skillsService = new SkillsService();
export default skillsService;