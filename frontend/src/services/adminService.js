import apiService from './api.js';

class AdminService {
    async getAllMentors() {
        try {
            return await apiService.get('/admin/mentors');
        } catch (error) {
            console.error('Get mentors error:', error);
            throw new Error(error.message || 'Failed to get mentors');
        }
    }

    async createMentor(mentorData) {
        try {
            return await apiService.post('/admin/create-mentor', mentorData);
        } catch (error) {
            console.error('Create mentor error:', error);
            throw new Error(error.message || 'Failed to create mentor');
        }
    }
}

export const adminService = new AdminService();
export default adminService;
