import api from "../api/axios";

const notificationService = {
  // Get all notifications for the current user (with pagination)
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await api.get('/notifications', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error fetching notifications:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get unread count only
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error fetching unread count:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark a single notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error marking notification as read:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error marking all notifications as read:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error deleting notification:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // ===========================================
  // ADMIN NOTIFICATION CREATION
  // ===========================================

  async createForumNotification(forumData) {
    try {
      const response = await api.post('/notifications/forum', forumData);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating forum notification:', error);
      throw error;
    }
  },

  async createPetTipsNotification(tipData) {
    try {
      const response = await api.post('/notifications/pet-tips', tipData);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating pet tips notification:', error);
      throw error;
    }
  },

  async createVideoNotification(videoData) {
    try {
      const response = await api.post('/notifications/video', videoData);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating video notification:', error);
      throw error;
    }
  },

  async createAppointmentNotification(appointmentData) {
    try {
      const response = await api.post('/notifications/appointment', appointmentData);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating appointment notification:', error);
      throw error;
    }
  },

  async createMedicalRecordNotification(medicalData) {
    try {
      const response = await api.post('/notifications/medical-record', medicalData);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating medical record notification:', error);
      throw error;
    }
  }
};

export default notificationService;