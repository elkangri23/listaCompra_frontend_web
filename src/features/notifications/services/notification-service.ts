import { axiosInstance } from '@/lib/api/axios-instance';
import { Notification, PaginatedNotifications } from '@/types/Notification.types';

export const notificationService = {
  async getNotifications(page: number = 1, limit: number = 10): Promise<PaginatedNotifications> {
    const response = await axiosInstance.get(`/notifications`, {
      params: { page, limit },
    });
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async deleteNotification(id: string): Promise<void> {
    await axiosInstance.delete(`/notifications/${id}`);
  },
};
