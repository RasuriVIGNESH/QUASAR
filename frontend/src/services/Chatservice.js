import apiService from './api.js';

/**
 * ChatService
 * 
 * Comprehensive chat management service with full endpoint coverage.
 * Implements production-grade error handling, validation, and caching strategies.
 * All methods support configurable cache TTL for optimal performance.
 */
class ChatService {
  constructor() {
    // Default cache TTL for chat messages (5 seconds for near real-time updates)
    this.messageCacheTTL = 5000;
    // Cache TTL for message counts (10 seconds)
    this.countCacheTTL = 10000;
  }

  /**
   * Send a new message to project chat
   * @param {string} projectId - Project ID
   * @param {string} content - Message content
   * @returns {Promise} Response from server
   */
  async sendMessage(projectId, content) {
    try {
      if (!projectId) throw new Error('Project ID is required');
      if (!content || content.trim().length === 0) throw new Error('Message content is required');

      const response = await apiService.post(
        `/chat/projects/${projectId}/messages`,
        { content: content.trim() }
      );

      // Invalidate message cache for this project after sending
      apiService.invalidateCache(`/chat/projects/${projectId}`);

      return response;
    } catch (error) {
      console.error('ChatService: Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get paginated project messages
   * @param {string} projectId - Project ID
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Number of messages per page
   * @returns {Promise} Paginated messages response
   */
  async getProjectMessages(projectId, page = 0, size = 50) {
    try {
      if (!projectId) throw new Error('Project ID is required');

      const response = await apiService.get(
        `/chat/projects/${projectId}/messages`,
        { page, size },
        { cacheTTL: this.messageCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('ChatService: Error getting project messages:', error);
      throw error;
    }
  }

  /**
   * Get recent messages (last 24 hours)
   * @param {string} projectId - Project ID
   * @returns {Promise} Recent messages
   */
  async getRecentMessages(projectId) {
    try {
      if (!projectId) throw new Error('Project ID is required');

      const response = await apiService.get(
        `/chat/projects/${projectId}/messages/recent`,
        {},
        { cacheTTL: this.messageCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('ChatService: Error getting recent messages:', error);
      throw error;
    }
  }

  /**
   * Search messages within a project
   * @param {string} projectId - Project ID
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} size - Results per page
   * @returns {Promise} Search results
   */
  async searchMessages(projectId, query, page = 0, size = 20) {
    try {
      if (!projectId) throw new Error('Project ID is required');
      if (!query || query.trim().length === 0) throw new Error('Search query is required');

      const response = await apiService.get(
        `/chat/projects/${projectId}/messages/search`,
        { query: query.trim(), page, size },
        { skipCache: true } // Don't cache search results
      );

      return response;
    } catch (error) {
      console.error('ChatService: Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Get messages after a specific timestamp
   * @param {string} projectId - Project ID
   * @param {string|number} afterTime - Timestamp or ISO date string
   * @returns {Promise} Messages after the specified time
   */
  async getMessagesAfter(projectId, afterTime) {
    try {
      if (!projectId) throw new Error('Project ID is required');
      if (!afterTime) throw new Error('After time is required');

      const response = await apiService.get(
        `/chat/projects/${projectId}/messages/after`,
        { after: afterTime },
        { skipCache: true } // Don't cache time-based queries
      );

      return response;
    } catch (error) {
      console.error('ChatService: Error getting messages after time:', error);
      throw error;
    }
  }

  /**
   * Edit an existing message
   * @param {string} messageId - Message ID
   * @param {string} content - New message content
   * @returns {Promise} Updated message
   */
  async editMessage(messageId, content) {
    try {
      if (!messageId) throw new Error('Message ID is required');
      if (!content || content.trim().length === 0) throw new Error('Message content is required');

      const response = await apiService.put(
        `/chat/messages/${messageId}`,
        { content: content.trim() }
      );

      // Invalidate all chat caches after edit
      apiService.invalidateCache('/chat');

      return response;
    } catch (error) {
      console.error('ChatService: Error editing message:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   * @param {string} messageId - Message ID
   * @returns {Promise} Deletion response
   */
  async deleteMessage(messageId) {
    try {
      if (!messageId) throw new Error('Message ID is required');

      const response = await apiService.delete(`/chat/messages/${messageId}`);

      // Invalidate all chat caches after deletion
      apiService.invalidateCache('/chat');

      return response;
    } catch (error) {
      console.error('ChatService: Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Get the latest message in a project
   * @param {string} projectId - Project ID
   * @returns {Promise} Latest message
   */
  async getLatestMessage(projectId) {
    try {
      if (!projectId) throw new Error('Project ID is required');

      const response = await apiService.get(
        `/chat/projects/${projectId}/messages/latest`,
        {},
        { cacheTTL: this.messageCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('ChatService: Error getting latest message:', error);
      throw error;
    }
  }

  /**
   * Get total message count for a project
   * @param {string} projectId - Project ID
   * @returns {Promise} Message count
   */
  async getMessageCount(projectId) {
    try {
      if (!projectId) throw new Error('Project ID is required');

      const response = await apiService.get(
        `/chat/projects/${projectId}/messages/count`,
        {},
        { cacheTTL: this.countCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('ChatService: Error getting message count:', error);
      throw error;
    }
  }

  /**
   * Get a specific message by ID
   * @param {string} messageId - Message ID
   * @returns {Promise} Message details
   */
  async getMessageById(messageId) {
    try {
      if (!messageId) throw new Error('Message ID is required');

      const response = await apiService.get(
        `/chat/messages/${messageId}`,
        {},
        { cacheTTL: this.messageCacheTTL }
      );

      return response;
    } catch (error) {
      console.error('ChatService: Error getting message by ID:', error);
      throw error;
    }
  }

  /**
   * Poll for new messages (helper for real-time simulation)
   * @param {string} projectId - Project ID
   * @param {string|number} lastMessageTime - Timestamp to poll from
   * @param {number} intervalMs - Poll interval in milliseconds
   * @returns {number} Interval ID for cleanup
   */
  async startPolling(projectId, lastMessageTime, intervalMs = 5000) {
    try {
      if (!projectId) throw new Error('Project ID is required');

      const pollMessages = async () => {
        try {
          return await this.getMessagesAfter(projectId, lastMessageTime);
        } catch (error) {
          console.error('ChatService: Polling error:', error);
          return null;
        }
      };

      return setInterval(pollMessages, intervalMs);
    } catch (error) {
      console.error('ChatService: Error starting polling:', error);
      throw error;
    }
  }

  /**
   * Stop message polling
   * @param {number} intervalId - Interval ID from startPolling
   */
  stopPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  /**
   * Batch fetch messages from multiple projects
   * @param {string[]} projectIds - Array of project IDs
   * @returns {Promise} Messages from all projects
   */
  async getMessagesFromProjects(projectIds) {
    try {
      if (!projectIds || projectIds.length === 0) {
        throw new Error('At least one project ID is required');
      }

      const promises = projectIds.map(projectId =>
        this.getRecentMessages(projectId).catch(() => [])
      );

      const results = await Promise.all(promises);
      return results.flat();
    } catch (error) {
      console.error('ChatService: Error batch fetching messages:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
