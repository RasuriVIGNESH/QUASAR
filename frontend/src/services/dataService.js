import apiService from './api.js';

/**
 * DataService
 * 
 * Comprehensive data management service for static data, events, and recommendations.
 * Implements production-grade error handling, validation, and caching strategies.
 * Eliminates mock data fallbacks in favor of real backend responses.
 */
class DataService {
  constructor() {
    // Cache TTL for static data (120 seconds - rarely changes)
    this.staticDataCacheTTL = 120000;
    // Cache TTL for event data (30 seconds)
    this.eventCacheTTL = 30000;
    // Cache TTL for recommendations (60 seconds)
    this.recommendationCacheTTL = 60000;
  }

  /**
   * Get available branches
   * @returns {Promise} List of branches
   */
  async getBranches() {
    try {
      const response = await apiService.get(
        '/branches',
        {},
        { cacheTTL: this.staticDataCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error getting branches:', error);
      throw error;
    }
  }

  /**
   * Get graduation years
   * @returns {Promise} List of graduation years
   */
  async getGraduationYears() {
    try {
      const response = await apiService.get(
        '/graduation-years',
        {},
        { cacheTTL: this.staticDataCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error getting graduation years:', error);
      throw error;
    }
  }

  /**
   * Get all colleges
   * @returns {Promise} List of colleges
   */
  async getColleges() {
    try {
      const response = await apiService.get(
        '/colleges',
        {},
        { cacheTTL: this.staticDataCacheTTL }
      );

      // Normalize response format
      if (Array.isArray(response)) {
        return { data: response };
      }

      return response;
    } catch (error) {
      console.error('DataService: Error getting colleges:', error);
      throw error;
    }
  }

  /**
   * Get single college by ID
   * @param {string|number} id - College ID
   * @returns {Promise} College details
   */
  async getCollegeById(id) {
    try {
      if (!id) throw new Error('College ID is required');

      const response = await apiService.get(
        `/colleges/${id}`,
        {},
        { cacheTTL: this.staticDataCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting college ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get college by name
   * @param {string} name - College name
   * @returns {Promise} College details
   */
  async getCollegeByName(name) {
    try {
      if (!name) throw new Error('College name is required');

      const response = await apiService.get(
        `/colleges/name/${encodeURIComponent(name)}`,
        {},
        { cacheTTL: this.staticDataCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting college by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Create college (admin only)
   * @param {Object} collegeData - College data
   * @returns {Promise} Created college
   */
  async createCollege(collegeData) {
    try {
      if (!collegeData.name || !collegeData.location) {
        throw new Error('College name and location are required');
      }

      const response = await apiService.post('/colleges', collegeData);

      // Invalidate college cache after creation
      apiService.invalidateCache('/colleges');

      return response;
    } catch (error) {
      console.error('DataService: Error creating college:', error);
      throw error;
    }
  }

  /**
   * Delete college (admin only)
   * @param {string|number} id - College ID
   * @returns {Promise} Deletion response
   */
  async deleteCollege(id) {
    try {
      if (!id) throw new Error('College ID is required');

      const response = await apiService.delete(`/colleges/${id}`);

      // Invalidate college cache after deletion
      apiService.invalidateCache('/colleges');

      return response;
    } catch (error) {
      console.error(`DataService: Error deleting college ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get project categories
   * @returns {Promise} List of project categories
   */
  async getProjectCategories() {
    try {
      const response = await apiService.get(
        '/projects/categories',
        {},
        { cacheTTL: this.staticDataCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error getting project categories:', error);
      throw error;
    }
  }

  /**
   * Get recommended projects for a user
   * @param {string} userId - User ID
   * @returns {Promise} Recommended projects
   */
  async getRecommendedProjects(userId) {
    try {
      if (!userId) throw new Error('User ID is required');

      const response = await apiService.get(
        `/recommendations/user/${userId}`,
        {},
        { cacheTTL: this.recommendationCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting recommended projects for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get top recommended projects for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of projects to return
   * @returns {Promise} Top recommended projects
   */
  async getTopRecommendedProjects(userId, limit = 5) {
    try {
      if (!userId) throw new Error('User ID is required');

      const params = { limit };
      const response = await apiService.get(
        `/recommendations/user/${userId}/top`,
        params,
        { cacheTTL: this.recommendationCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting top recommended projects for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get system-wide counts (users, projects, etc.)
   * @returns {Promise} System counts
   */
  async getSystemCounts() {
    try {
      const response = await apiService.get(
        '/count',
        {},
        { preventRedirect: true, cacheTTL: this.staticDataCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error getting system counts:', error);
      throw error;
    }
  }

  /**
   * Create event (admin only)
   * @param {Object} eventData - Event data
   * @returns {Promise} Created event
   */
  async createEvent(eventData) {
    try {
      if (!eventData.name) throw new Error('Event name is required');

      const response = await apiService.post('/events', eventData);

      // Invalidate event caches after creation
      apiService.invalidateCache('/events');

      return response;
    } catch (error) {
      console.error('DataService: Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update event (admin only)
   * @param {string|number} id - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise} Updated event
   */
  async updateEvent(id, eventData) {
    try {
      if (!id) throw new Error('Event ID is required');

      const response = await apiService.put(`/events/${id}`, eventData);

      // Invalidate event caches after update
      apiService.invalidateCache('/events');

      return response;
    } catch (error) {
      console.error(`DataService: Error updating event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete event (admin only)
   * @param {string|number} id - Event ID
   * @returns {Promise} Deletion response
   */
  async deleteEvent(id) {
    try {
      if (!id) throw new Error('Event ID is required');

      const response = await apiService.delete(`/events/${id}`);

      // Invalidate event caches after deletion
      apiService.invalidateCache('/events');

      return response;
    } catch (error) {
      console.error(`DataService: Error deleting event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get upcoming events
   * @returns {Promise} List of upcoming events
   */
  async getUpcomingEvents() {
    try {
      const response = await apiService.get(
        '/events/upcoming',
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error getting upcoming events:', error);
      throw error;
    }
  }

  /**
   * Get recent events
   * @returns {Promise} List of recent events
   */
  async getRecentEvents() {
    try {
      const response = await apiService.get(
        '/events/recent',
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error getting recent events:', error);
      throw error;
    }
  }

  /**
   * Get all events
   * @returns {Promise} List of all events
   */
  async getAllEvents() {
    try {
      const response = await apiService.get(
        '/events/all',
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error getting all events:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   * @param {string|number} id - Event ID
   * @returns {Promise} Event details
   */
  async getEventById(id) {
    try {
      if (!id) throw new Error('Event ID is required');

      const response = await apiService.get(
        `/events/${id}`,
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get event attendees
   * @param {string|number} id - Event ID
   * @returns {Promise} List of event attendees
   */
  async getEventAttendees(id) {
    try {
      if (!id) throw new Error('Event ID is required');

      const response = await apiService.get(
        `/events/${id}/students`,
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting event attendees ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get event projects
   * @param {string|number} id - Event ID
   * @returns {Promise} List of event projects
   */
  async getEventProjects(id) {
    try {
      if (!id) throw new Error('Event ID is required');

      const response = await apiService.get(
        `/events/${id}/projects`,
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting event projects ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if user is registered for event
   * @param {string|number} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise} Registration status
   */
  async checkEventRegistration(eventId, userId) {
    try {
      if (!eventId || !userId) {
        throw new Error('Event ID and User ID are required');
      }

      const response = await apiService.get(
        `/events/${eventId}/students/${userId}/exists`,
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('DataService: Error checking event registration:', error);
      throw error;
    }
  }

  /**
   * Get event attendee count
   * @param {string|number} id - Event ID
   * @returns {Promise} Attendee count
   */
  async getEventAttendeeCount(id) {
    try {
      if (!id) throw new Error('Event ID is required');

      const response = await apiService.get(
        `/events/${id}/students/count`,
        {},
        { cacheTTL: this.eventCacheTTL }
      );

      return response;
    } catch (error) {
      console.error(`DataService: Error getting event attendee count ${id}:`, error);
      throw error;
    }
  }

  /**
   * Register current user for event
   * @param {string|number} eventId - Event ID
   * @returns {Promise} Registration response
   */
  async registerForEvent(eventId) {
    try {
      if (!eventId) throw new Error('Event ID is required');

      const response = await apiService.post(`/events/${eventId}/register`, {});

      // Invalidate event caches after registration
      apiService.invalidateCache(`/events/${eventId}`);

      return response;
    } catch (error) {
      console.error(`DataService: Error registering for event ${eventId}:`, error);
      throw error;
    }
  }

  /**
   * Get all static data at once (optimized batch call)
   * @returns {Promise} All static data
   */
  async getAllStaticData() {
    try {
      const [branches, graduationYears, projectCategories, colleges] = await Promise.all([
        this.getBranches(),
        this.getGraduationYears(),
        this.getProjectCategories(),
        this.getColleges()
      ]);

      return {
        success: true,
        data: {
          branches: branches?.data || branches,
          graduationYears: graduationYears?.data || graduationYears,
          projectCategories: projectCategories?.data || projectCategories,
          colleges: colleges?.data || colleges
        },
        message: 'All static data retrieved successfully'
      };
    } catch (error) {
      console.error('DataService: Error getting all static data:', error);
      throw error;
    }
  }

  /**
   * Batch fetch events
   * @param {Array} eventIds - Array of event IDs
   * @returns {Promise} Events data
   */
  async getEventsBatch(eventIds) {
    try {
      if (!eventIds || eventIds.length === 0) {
        throw new Error('At least one event ID is required');
      }

      const promises = eventIds.map(id =>
        this.getEventById(id).catch(() => null)
      );

      const results = await Promise.all(promises);
      return results.filter(event => event !== null);
    } catch (error) {
      console.error('DataService: Error batch fetching events:', error);
      throw error;
    }
  }
}

export const dataService = new DataService();
export default dataService;
