import apiService from './api.js';

class NotificationService {
  async getNotifications({ page = 0, size = 20, unreadOnly, type } = {}) {
    return apiService.get('/notifications', { page, size, unreadOnly, type }, { skipCache: true });
  }

  async getUnreadCount() {
    return apiService.get('/notifications/unread-count', {}, { skipCache: true });
  }

  async markAsRead(notificationId) {
    if (!notificationId) throw new Error('Notification ID is required');
    return apiService.patch(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead() {
    return apiService.patch('/notifications/read-all');
  }

  async getUnreadNotifications(page = 0, size = 20) {
    return this.getNotifications({ page, size, unreadOnly: true });
  }

  static list(response) {
    const body = response?.data ?? response;
    return Array.isArray(body) ? body : body?.content || [];
  }
}

export const notificationService = new NotificationService();
export default notificationService;
