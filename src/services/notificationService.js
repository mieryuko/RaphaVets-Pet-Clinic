import api from "../api/axios";

const notificationService = {
  // Get all notifications for the current user (with pagination)
  async getNotifications(page = 1, limit = 20) {
    console.log('🔍 [notificationService] getNotifications called with:', { page, limit });
    try {
      console.log('🔍 [notificationService] Making API request to /notifications...');
      const response = await api.get('/notifications', {
        params: { page, limit }
      });
      console.log('✅ [notificationService] getNotifications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error fetching notifications:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get unread count only
  async getUnreadCount() {
    console.log('🔍 [notificationService] getUnreadCount called');
    try {
      console.log('🔍 [notificationService] Making API request to /unread-count...');
      const response = await api.get('/notifications/unread-count');
      console.log('✅ [notificationService] getUnreadCount response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error fetching unread count:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark a single notification as read
  async markAsRead(notificationId) {
    console.log('🔍 [notificationService] markAsRead called with notificationId:', notificationId);
    try {
      console.log('🔍 [notificationService] Making API request to:', `/notifications/${notificationId}/read`);
      const response = await api.post(`/notifications/${notificationId}/read`);
      console.log('✅ [notificationService] markAsRead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error marking notification as read:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    console.log('🔍 [notificationService] markAllAsRead called');
    try {
      console.log('🔍 [notificationService] Making API request to /mark-all-read...');
      const response = await api.post('/notifications/mark-all-read');
      console.log('✅ [notificationService] markAllAsRead response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error marking all notifications as read:', error);
      console.error('❌ [notificationService] Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    console.log('🔍 [notificationService] deleteNotification called with notificationId:', notificationId);
    try {
      console.log('🔍 [notificationService] Making API request to:', `/notifications/${notificationId}`);
      const response = await api.delete(`/notifications/${notificationId}`);
      console.log('✅ [notificationService] deleteNotification response:', response.data);
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
    console.log('🔍 [notificationService] createForumNotification called with:', forumData);
    try {
      const response = await api.post('/notifications/forum', forumData);
      console.log('✅ [notificationService] createForumNotification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating forum notification:', error);
      throw error;
    }
  },

  async createPetTipsNotification(tipData) {
    console.log('🔍 [notificationService] createPetTipsNotification called with:', tipData);
    try {
      const response = await api.post('/notifications/pet-tips', tipData);
      console.log('✅ [notificationService] createPetTipsNotification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating pet tips notification:', error);
      throw error;
    }
  },

  async createVideoNotification(videoData) {
    console.log('🔍 [notificationService] createVideoNotification called with:', videoData);
    try {
      const response = await api.post('/notifications/video', videoData);
      console.log('✅ [notificationService] createVideoNotification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating video notification:', error);
      throw error;
    }
  },

  async createAppointmentNotification(appointmentData) {
    console.log('🔍 [notificationService] createAppointmentNotification called with:', appointmentData);
    try {
      const response = await api.post('/notifications/appointment', appointmentData);
      console.log('✅ [notificationService] createAppointmentNotification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating appointment notification:', error);
      throw error;
    }
  },

  async createMedicalRecordNotification(medicalData) {
    console.log('🔍 [notificationService] createMedicalRecordNotification called with:', medicalData);
    try {
      const response = await api.post('/notifications/medical-record', medicalData);
      console.log('✅ [notificationService] createMedicalRecordNotification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [notificationService] Error creating medical record notification:', error);
      throw error;
    }
  }
};

export default notificationService;