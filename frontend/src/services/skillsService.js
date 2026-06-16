import apiService from './api.js';

/**
 * SkillsService
 * 
 * Comprehensive skill management service with full endpoint coverage.
 * Implements production-grade error handling, validation, and caching strategies.
 * Supports skill discovery, management, and user skill operations.
 */
class SkillsService {
    constructor() {
        // Cache TTL for static skill data (60 seconds - rarely changes)
        this.staticDataCacheTTL = 60000;
        // Cache TTL for user skills (30 seconds)
        this.userSkillsCacheTTL = 30000;
        // Cache TTL for skill lists (30 seconds)
        this.skillListCacheTTL = 30000;
    }

    /**
     * Get predefined skills (static data)
     * @returns {Promise} Predefined skills mapped by category
     */
    async getPredefinedSkills() {
        try {
            const response = await apiService.get(
                '/skills/predefined',
                {},
                { cacheTTL: this.staticDataCacheTTL }
            );

            // IMPORTANT FIX
            const rawData = response?.data || response || {};

            if (
                rawData &&
                typeof rawData === 'object' &&
                !Array.isArray(rawData)
            ) {
                const formatted = Object.entries(rawData).map(
                    ([name, category]) => ({
                        name,
                        category
                    })
                );

                return {
                    data: formatted,
                    success: true
                };
            }

            return {
                data: [],
                success: true
            };
        } catch (error) {
            console.error(
                'SkillsService: Error getting predefined skills:',
                error
            );

            return {
                data: [],
                success: false
            };
        }
    }

    /**
     * Get all skills with pagination
     * @param {number} page - Page number (0-indexed)
     * @param {number} size - Items per page
     * @param {string} sortBy - Sort field
     * @param {string} sortDir - Sort direction (asc/desc)
     * @returns {Promise} Paginated skills response
     */
    async getAllSkills(page = 0, size = 10, sortBy = 'name', sortDir = 'asc') {
        try {
            const params = { page, size, sortBy, sortDir };
            const response = await apiService.get(
                '/skills',
                params,
                { cacheTTL: this.skillListCacheTTL }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error getting all skills:', error);
            throw error;
        }
    }

    /**
     * Get skill categories
     * @returns {Promise} List of skill categories
     */
    async getSkillCategories() {
        try {
            const response = await apiService.get(
                '/skills/categories',
                {},
                { cacheTTL: this.staticDataCacheTTL }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error getting skill categories:', error);
            throw error;
        }
    }

    /**
     * Get skills by category
     * @param {string} category - Category name
     * @param {number} page - Page number
     * @param {number} size - Items per page
     * @returns {Promise} Skills in the specified category
     */
    async getSkillsByCategory(category, page = 0, size = 10) {
        try {
            if (!category) throw new Error('Category is required');

            const params = { page, size };
            const response = await apiService.get(
                `/skills/category/${category}`,
                params,
                { cacheTTL: this.skillListCacheTTL }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error getting skills by category:', error);
            throw error;
        }
    }

    /**
     * Get popular skills
     * @param {number} page - Page number
     * @param {number} size - Items per page
     * @returns {Promise} Popular skills
     */
    async getPopularSkills(page = 0, size = 10) {
        try {
            const params = { page, size };
            const response = await apiService.get(
                '/popularSkills',
                params,
                { cacheTTL: this.skillListCacheTTL }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error getting popular skills:', error);
            throw error;
        }
    }

    /**
     * Search skills by name or query
     * @param {string} searchTerm - Search term
     * @param {number} page - Page number
     * @param {number} size - Items per page
     * @returns {Promise} Search results
     */
    async searchSkills(searchTerm, page = 0, size = 10) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return { data: { content: [] } };
            }

            const params = { query: searchTerm.trim(), page, size };
            const response = await apiService.get(
                '/skills/search',
                params,
                { skipCache: true } // Don't cache search results
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error searching skills:', error);
            throw error;
        }
    }

    /**
     * Search skills by name (skill discovery endpoint)
     * @param {string} name - Skill name
     * @returns {Promise} Matching skills
     */
    async searchSkillsByName(name) {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Skill name is required');
            }

            const response = await apiService.get(
                `/skills/discovery/by-name/${encodeURIComponent(name.trim())}`,
                {},
                { skipCache: true }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error searching skills by name:', error);
            throw error;
        }
    }

    /**
     * Get skills by category (skill discovery endpoint)
     * @param {string} category - Category name
     * @returns {Promise} Skills in category
     */
    async getSkillsByDiscoveryCategory(category) {
        try {
            if (!category) throw new Error('Category is required');

            const response = await apiService.get(
                `/skills/discovery/category/${category}`,
                {},
                { cacheTTL: this.skillListCacheTTL }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error getting skills by discovery category:', error);
            throw error;
        }
    }

    /**
     * Get discovery categories
     * @returns {Promise} Available discovery categories
     */
    async getDiscoveryCategories() {
        try {
            const response = await apiService.get(
                '/skills/discovery/categories',
                {},
                { cacheTTL: this.staticDataCacheTTL }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error getting discovery categories:', error);
            throw error;
        }
    }

    /**
     * Search skills (skill discovery endpoint)
     * @param {string} query - Search query
     * @returns {Promise} Search results
     */
    async searchSkillsDiscovery(query) {
        try {
            if (!query || query.trim().length === 0) {
                throw new Error('Search query is required');
            }

            const params = { query: query.trim() };
            const response = await apiService.get(
                '/skills/discovery/search',
                params,
                { skipCache: true }
            );

            return response;
        } catch (error) {
            console.error('SkillsService: Error searching skills discovery:', error);
            throw error;
        }
    }

    /**
     * Create a new skill (admin)
     * @param {Object} skillData - Skill data
     * @returns {Promise} Created skill
     */
    async createSkill(skillData) {
        try {
            if (!skillData.name || !skillData.category) {
                throw new Error('Skill name and category are required');
            }

            const response = await apiService.post('/skills', skillData);

            // Invalidate skill caches after creation
            apiService.invalidateCache('/skills');

            return response;
        } catch (error) {
            console.error('SkillsService: Error creating skill:', error);
            throw error;
        }
    }

    /**
     * Update a skill (admin)
     * @param {string} skillId - Skill ID
     * @param {Object} skillData - Updated skill data
     * @returns {Promise} Updated skill
     */
    async updateSkill(skillId, skillData) {
        try {
            if (!skillId) throw new Error('Skill ID is required');
            if (!skillData.name || !skillData.category) {
                throw new Error('Skill name and category are required');
            }

            const response = await apiService.put(`/skills/${skillId}`, skillData);

            // Invalidate skill caches after update
            apiService.invalidateCache('/skills');

            return response;
        } catch (error) {
            console.error('SkillsService: Error updating skill:', error);
            throw error;
        }
    }

    /**
     * Delete a skill (admin)
     * @param {string} skillId - Skill ID
     * @returns {Promise} Deletion response
     */
    async deleteSkill(skillId) {
        try {
            if (!skillId) throw new Error('Skill ID is required');

            const response = await apiService.delete(`/skills/${skillId}`);

            // Invalidate skill caches after deletion
            apiService.invalidateCache('/skills');

            return response;
        } catch (error) {
            console.error('SkillsService: Error deleting skill:', error);
            throw error;
        }
    }

    /**
     * Get user skills by user ID
     * @param {string} userId - User ID
     * @returns {Promise} User's skills
     */
    async getUserSkillsByUserId(userId) {
        try {
            if (!userId) throw new Error('User ID is required');

            const response = await apiService.get(
                `/students/users/${userId}/skills`,
                {},
                { cacheTTL: this.userSkillsCacheTTL }
            );

            // Handle both direct array and wrapped responses
            const skillsData = response?.data || response || [];
            return {
                data: Array.isArray(skillsData) ? skillsData : (skillsData.content || []),
                success: true
            };
        } catch (error) {
            console.error('SkillsService: Error getting user skills:', error);
            return { data: [], success: false, error: error.message };
        }
    }

    /**
     * Add a single user skill
     * @param {Object} skillData - Skill data with name, level, experience, category
     * @param {Object} currentUser - Current user object
     * @returns {Promise} Added skill
     */
    async addUserSkill(skillData, currentUser) {
        try {
            if (!skillData.skillName) throw new Error('Skill name is required');

            const requestData = {
                skillName: skillData.skillName,
                category: skillData.category || skillData.skill?.category || '',
                level: skillData.level || 'BEGINNER',
                experience: String(skillData.experience || skillData.notes || '0'),
                currentUser: currentUser
            };

            const response = await apiService.post('/skills', requestData);

            // Invalidate user skills cache
            if (currentUser?.id) {
                apiService.invalidateCache(`/students/users/${currentUser.id}/skills`);
            }

            return response;
        } catch (error) {
            console.error('SkillsService: Error adding user skill:', error);
            throw error;
        }
    }

    /**
     * Add multiple user skills at once
     * @param {Array} skillsList - Array of skill objects
     * @param {Object} currentUser - Current user object
     * @returns {Promise} Batch add response
     */
    async addBatchSkills(skillsList, currentUser) {
        try {
            if (!skillsList || skillsList.length === 0) {
                throw new Error('At least one skill is required');
            }

            const skillsPayload = skillsList.map(s => ({
                skillName: s.skillName || s.skill?.name || s.name,
                level: s.level || 'BEGINNER',
                experience: String(s.experience || '0'),
                category: s.category || s.skill?.category || ''
            }));

            const payload = { skills: skillsPayload };
            const response = await apiService.post('/skills/batch', payload);

            // Invalidate user skills cache
            if (currentUser?.id) {
                apiService.invalidateCache(`/students/users/${currentUser.id}/skills`);
            }

            return response;
        } catch (error) {
            console.error('SkillsService: Error adding batch skills:', error);
            throw error;
        }
    }

    /**
     * Update user skill
     * @param {string} skillId - Skill ID
     * @param {Object} skillData - Updated skill data
     * @returns {Promise} Updated user skill
     */
    async updateUserSkill(skillId, skillData) {
        try {
            if (!skillId) throw new Error('Skill ID is required');

            const requestData = {
                level: skillData.level || 'BEGINNER',
                experience: skillData.experience || skillData.notes || ''
            };

            const response = await apiService.put(`/skills/${skillId}`, requestData);

            // Invalidate user skills cache
            apiService.invalidateCache('/students/users');

            return response;
        } catch (error) {
            console.error('SkillsService: Error updating user skill:', error);
            throw error;
        }
    }

    /**
     * Delete user skill
     * @param {string} skillId - Skill ID
     * @returns {Promise} Deletion response
     */
    async deleteUserSkill(skillId) {
        try {
            if (!skillId) throw new Error('Skill ID is required');

            const response = await apiService.delete(`/skills/${skillId}`);

            // Invalidate user skills cache
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
