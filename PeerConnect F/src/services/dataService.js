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
      if (response && Array.isArray(response)) {
        return { data: response };
      } else if (response && Array.isArray(response.data)) {
        return response;
      } else {
        console.warn('DataService: Unexpected colleges response format:', response);
        return { data: [] }; // Return empty array as fallback
      }
    } catch (error) {
      console.error('DataService: Error getting colleges:', error);
      // Return empty array instead of throwing to prevent registration form from breaking
      return { data: [] };
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