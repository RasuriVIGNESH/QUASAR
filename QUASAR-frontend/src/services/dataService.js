import apiService from './api.js';

class DataService {
  // Get available branches - matches StaticDataController endpoint
  async getBranches() {
    try {
      console.log('DataService: Getting branches...');
      const response = await apiService.get('/branches');
      console.log('DataService: Branches response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting branches:', error);
      throw new Error(error.message || 'Failed to get branches data');
    }
  }

  // Get graduation years - matches StaticDataController endpoint
  async getGraduationYears() {
    try {
      console.log('DataService: Getting graduation years...');
      const response = await apiService.get('/graduation-years');
      console.log('DataService: Graduation years response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting graduation years:', error);
      throw new Error(error.message || 'Failed to get graduation years');
    }
  }

  // Get colleges - matches the /api/colleges endpoint
  async getColleges(options = {}) {
    try {
      console.log('DataService: Getting colleges...');
      const response = await apiService.get('/colleges', {}, options);
      console.log('DataService: Colleges response:', response);

      // Handle different response formats
      if (response && Array.isArray(response) && response.length > 0) {
        return { data: response };
      } else if (response && Array.isArray(response.data) && response.data.length > 0) {
        return response;
      } else {
        console.warn('DataService: No data from colleges endpoint, using mock data');
        // Mock data as requested
        const mockColleges = [
          { id: 1, name: 'woxsen', location: 'hyderabad' },
          { id: 2, name: 'mahendra', location: 'telangana' }
        ];
        return { data: mockColleges };
      }
    } catch (error) {
      console.error('DataService: Error getting colleges:', error);
      console.warn('DataService: Using mock data for colleges due to error');
      // Mock data as requested
      const mockColleges = [
        { id: 1, name: 'woxsen', location: 'hyderabad' },
        { id: 2, name: 'mahendra', location: 'telangana' }
      ];
      return { data: mockColleges };
    }
  }

  // Get single collage by ID
  async getCollageById(id) {
    try {
      if (!id) throw new Error('Collage ID is required');
      return await apiService.get(`/colleges/${id}`);
    } catch (error) {
      console.error(`DataService: Error getting collage ${id}:`, error);
      throw error;
    }
  }

  // Get collage by name
  async getCollageByName(name) {
    try {
      if (!name) throw new Error('Collage name is required');
      return await apiService.get(`/colleges/name/${encodeURIComponent(name)}`);
    } catch (error) {
      console.error(`DataService: Error getting collage by name ${name}:`, error);
      throw error;
    }
  }

  // Create collage (Admin only)
  async createCollage(collageData) {
    try {
      return await apiService.post('/colleges', collageData);
    } catch (error) {
      console.error('DataService: Error creating collage:', error);
      throw error;
    }
  }

  // Delete collage (Admin only)
  async deleteCollage(id) {
    try {
      if (!id) throw new Error('Collage ID is required');
      return await apiService.delete(`/colleges/${id}`);
    } catch (error) {
      console.error(`DataService: Error deleting collage ${id}:`, error);
      throw error;
    }
  }

  // Get project categories (for getAllStaticData)
  async getProjectCategories() {
    try {
      // If projectService has this, we can duplicate logic or just call the endpoint
      return await apiService.get('/project-categories');
    } catch (error) {
      console.error('DataService: Error getting project categories:', error);
      return { data: [] };
    }
  }

  // Get recommended projects for a user
  async getRecommendedProjects(userId) {
    try {
      if (!userId) throw new Error('User ID is required');
      console.log(`DataService: Getting recommended projects for user ${userId}...`);
      const response = await apiService.get(`/recommendations/user/${userId}`);
      console.log('DataService: Recommended projects response:', response);
      return response;
    } catch (error) {
      console.error(`DataService: Error getting recommended projects for user ${userId}:`, error);
      return { recommendedProjects: [] }; // Return empty list as fallback
    }
  }

  // Get top 5 recommended projects for a user
  async getTopRecommendedProjects(userId, limit = 5) {
    try {
      if (!userId) throw new Error('User ID is required');
      console.log(`DataService: Getting top ${limit} recommended projects for user ${userId}...`);
      const response = await apiService.get(`/recommendations/user/${userId}/top?limit=${limit}`);
      console.log('DataService: Top recommended projects response:', response);
      return response;
    } catch (error) {
      console.error(`DataService: Error getting top recommended projects for user ${userId}:`, error);
      return { recommendedProjects: [] };
    }
  }

  // Get system counts (users, projects, etc.)
  async getSystemCounts() {
    try {
      console.log('DataService: Getting system counts...');
      const response = await apiService.get('/count', {}, { preventRedirect: true });
      console.log('DataService: System counts response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting system counts:', error);
      return {};
    }
  }

  // --- Event Endpoints ---

  // Create event (Admin)
  async createEvent(eventData) {
    try {
      console.log('DataService: Creating event...', eventData);
      return await apiService.post('/events', eventData);
    } catch (error) {
      console.error('DataService: Error creating event:', error);
      throw error;
    }
  }

  // Update event (Admin)
  async updateEvent(id, eventData) {
    try {
      if (!id) throw new Error('Event ID is required');
      console.log(`DataService: Updating event ${id}...`, eventData);
      return await apiService.put(`/events/${id}`, eventData);
    } catch (error) {
      console.error(`DataService: Error updating event ${id}:`, error);
      throw error;
    }
  }

  // Delete event (Admin)
  async deleteEvent(id) {
    try {
      if (!id) throw new Error('Event ID is required');
      console.log(`DataService: Deleting event ${id}...`);
      return await apiService.delete(`/events/${id}`);
    } catch (error) {
      console.error(`DataService: Error deleting event ${id}:`, error);
      throw error;
    }
  }

  // Get upcoming events
  async getUpcomingEvents() {
    try {
      console.log('DataService: Getting upcoming events...');
      const response = await apiService.get('/events/upcoming');
      console.log('DataService: Upcoming events response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting upcoming events:', error);
      console.warn('DataService: Using mock data for upcoming events');
      return [
        {
          id: 1,
          name: 'Tech Innovation Summit 2025',
          description: 'Join us for a day of inspiring talks and networking with industry leaders.',
          startDate: '2025-03-15T09:00:00',
          endDate: '2025-03-15T17:00:00',
          status: 'UPCOMING',
          location: 'Innovation Hub'
        },
        {
          id: 2,
          name: 'Hackathon: Future of AI',
          description: 'A 48-hour coding marathon to build the next generation of AI solutions.',
          startDate: '2025-04-10T18:00:00',
          endDate: '2025-04-12T18:00:00',
          status: 'UPCOMING',
          location: 'Online'
        }
      ];
    }
  }

  // Get recent events
  async getRecentEvents() {
    try {
      console.log('DataService: Getting recent events...');
      const response = await apiService.get('/events/recent');
      console.log('DataService: Recent events response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting recent events:', error);
      console.warn('DataService: Using mock data for recent events');
      return [
        {
          id: 3,
          name: 'Web Dev Workshop',
          description: 'Learn the latest web development trends and best practices.',
          startDate: '2025-02-20T10:00:00',
          endDate: '2025-02-20T14:00:00',
          status: 'COMPLETED',
          location: 'CS Building'
        }
      ];
    }
  }

  // Get all events
  async getAllEvents() {
    try {
      console.log('DataService: Getting all events...');
      const response = await apiService.get('/events/all');
      return response;
    } catch (error) {
      console.error('DataService: Error getting all events:', error);
      console.warn('DataService: Using mock data for all events');
      return [
        {
          id: 1,
          name: 'Tech Innovation Summit 2025',
          description: 'Join us for a day of inspiring talks and networking with industry leaders.',
          startDate: '2025-03-15T09:00:00',
          endDate: '2025-03-15T17:00:00',
          status: 'UPCOMING',
          location: 'Innovation Hub'
        },
        {
          id: 2,
          name: 'Hackathon: Future of AI',
          description: 'A 48-hour coding marathon to build the next generation of AI solutions.',
          startDate: '2025-04-10T18:00:00',
          endDate: '2025-04-12T18:00:00',
          status: 'UPCOMING',
          location: 'Online'
        },
        {
          id: 3,
          name: 'Web Dev Workshop',
          description: 'Learn the latest web development trends and best practices.',
          startDate: '2025-02-20T10:00:00',
          endDate: '2025-02-20T14:00:00',
          status: 'COMPLETED',
          location: 'CS Building'
        }
      ];
    }
  }

  // Get event by ID
  async getEventById(id) {
    try {
      if (!id) throw new Error('Event ID is required');
      return await apiService.get(`/events/${id}`);
    } catch (error) {
      console.error(`DataService: Error getting event ${id}:`, error);
      throw error;
    }
  }

  // Get event users
  async getEventUsers(id) {
    try {
      if (!id) throw new Error('Event ID is required');
      return await apiService.get(`/events/${id}/users`);
    } catch (error) {
      console.error(`DataService: Error getting event users ${id}:`, error);
      return [];
    }
  }

  // Check if user is in event
  async checkEventUserExists(eventId, userId) {
    try {
      if (!eventId || !userId) throw new Error('Event ID and User ID are required');
      return await apiService.get(`/events/${eventId}/users/${userId}/exists`);
    } catch (error) {
      console.error(`DataService: Error checking event user exists:`, error);
      return false;
    }
  }

  // Get event user count
  async getEventUserCount(id) {
    try {
      if (!id) throw new Error('Event ID is required');
      return await apiService.get(`/events/${id}/users/count`);
    } catch (error) {
      console.error(`DataService: Error getting event user count ${id}:`, error);
      return 0;
    }
  }

  // REMOVED METHODS: The following methods don't have corresponding backend endpoints
  // If you need these functionalities, implement them in the backend first:

  // async getSkillsData() - No backend endpoint
  // async getProjectTemplates() - No backend endpoint  
  // async getAchievements() - No backend endpoint

  // Utility method to get all static data at once
  async getAllStaticData() {
    try {
      console.log('DataService: Getting all static data...');

      const [branches, graduationYears, projectCategories] = await Promise.all([
        this.getBranches(),
        this.getGraduationYears(),
        this.getProjectCategories()
      ]);

      const staticData = {
        branches: branches?.data || branches,
        graduationYears: graduationYears?.data || graduationYears,
        projectCategories: projectCategories?.data || projectCategories
      };

      console.log('DataService: All static data retrieved:', staticData);
      return {
        success: true,
        data: staticData,
        message: 'All static data retrieved successfully'
      };
    } catch (error) {
      console.error('DataService: Error getting all static data:', error);
      throw new Error(error.message || 'Failed to get static data');
    }
  }
}

export const dataService = new DataService();
export default dataService;