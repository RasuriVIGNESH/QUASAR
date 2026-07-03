import apiService from './api.js';

class UserService {

  // GET /api/students/{userId}
    async getUserProfile(userId) {
        try {
        if (!userId || userId === 'undefined') throw new Error('Invalid user ID provided');
        return await apiService.get(`/students/${userId}`);
        } catch (error) {
        console.error('Get user profile error:', error);
        throw new Error(error.message || 'Failed to get user profile');
        }
    }

    // PUT /api/students/profile
    async updateUserProfile(profileData) {
        try {
        if (!profileData || typeof profileData !== 'object' || Object.keys(profileData).length === 0)
            throw new Error('Profile data is required');

        const cleanedData = {};
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined && profileData[key] !== null && profileData[key] !== '')
            cleanedData[key] = profileData[key];
        });

        if (Object.keys(cleanedData).length === 0)
            throw new Error('No valid profile data provided');

        return await apiService.put('/students/profile', cleanedData);
        } catch (error) {
        console.error('Update profile error:', error);
        throw new Error(error.message || 'Failed to update profile');
        }
    }

    // GET /api/students/search/students
    async searchUsers(searchParams) {
        try {
        const queryParams = new URLSearchParams();

        if (searchParams.search) queryParams.append('name', searchParams.search);
        if (searchParams.name) queryParams.append('name', searchParams.name);

        if (searchParams.skills) {
            if (Array.isArray(searchParams.skills))
            searchParams.skills.forEach(skill => queryParams.append('skills', skill));
            else
            queryParams.append('skills', searchParams.skills);
        }

        if (searchParams.branch) queryParams.append('branch', searchParams.branch);
        if (searchParams.graduationYear) queryParams.append('graduationYear', searchParams.graduationYear);
        if (searchParams.availability) queryParams.append('availabilityStatus', searchParams.availability);
        if (searchParams.availabilityStatus) queryParams.append('availabilityStatus', searchParams.availabilityStatus);
        if (searchParams.page !== undefined) queryParams.append('page', searchParams.page);
        if (searchParams.size !== undefined) queryParams.append('size', searchParams.size);
        if (searchParams.sortBy) queryParams.append('sortBy', searchParams.sortBy);
        if (searchParams.sortDir) queryParams.append('sortDir', searchParams.sortDir);

        const queryString = queryParams.toString();
        const endpoint = queryString
            ? `/students/search/students?${queryString}`
            : '/students/search/students';

        return await apiService.get(endpoint);
        } catch (error) {
        throw new Error(error.message || 'Failed to search users');
        }
    }

    // GET /api/students/sort
    async discoverUsers(filters = {}) {
        try {
        const queryParams = new URLSearchParams();

        if (filters.skills) {
            if (Array.isArray(filters.skills))
            filters.skills.forEach(skill => queryParams.append('skills', skill));
            else
            queryParams.append('skills', filters.skills);
        }

        if (filters.branch) queryParams.append('branch', filters.branch);
        if (filters.graduationYear) queryParams.append('graduationYear', filters.graduationYear);
        if (filters.availabilityStatus) queryParams.append('availabilityStatus', filters.availabilityStatus);
        if (filters.page !== undefined) queryParams.append('page', filters.page);
        if (filters.size !== undefined) queryParams.append('size', filters.size);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/students/sort?${queryString}` : '/students/sort';

        return await apiService.get(endpoint);
        } catch (error) {
        throw new Error(error.message || 'Failed to discover users');
        }
    }

    // POST /api/students/profile-photo
    async uploadProfilePicture(file) {
        try {
        if (!file) throw new Error('File is required');

        const formData = new FormData();
        formData.append('profilePhoto', file);

        const token = apiService.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        return await apiService.request('/students/profile-photo', {
            method: 'POST',
            body: formData,
            headers
        });
        } catch (error) {
        console.error('Upload profile photo error:', error);
        throw new Error(error.message || 'Failed to upload profile photo');
        }
    }

    // DELETE /api/students/profile-photo
    async deleteProfilePhoto() {
        try {
        return await apiService.delete('/students/profile-photo');
        } catch (error) {
        console.error('Delete profile photo error:', error);
        throw new Error(error.message || 'Failed to delete profile photo');
        }
    }

    // PUT /api/students/availability?status=
    async updateAvailabilityStatus(status) {
        try {
        if (!status) throw new Error('Status is required');
        return await apiService.put('/students/availability', null, { status });
        } catch (error) {
        throw new Error(error.message || 'Failed to update availability');
        }
    }

    // GET /api/count → [userCount, projectCount]
    async getPublicUserCount() {
        try {
        const response = await apiService.get('/count', {}, { preventRedirect: true });
        const arr = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
        return arr[0] || 0;
        } catch (error) {
        console.warn('Failed to fetch public user count:', error);
        return 0;
        }
    }

    // GET /api/students/users/{userId}/skills
    async getUserSkills(userId) {
        try {
        if (!userId) throw new Error('User ID is required');
        return await apiService.get(`/students/users/${userId}/skills`);
        } catch (error) {
        console.error('Get user skills error:', error);
        throw new Error(error.message || 'Failed to get user skills');
        }
    }
    }

export const userService = new UserService();
export default userService;