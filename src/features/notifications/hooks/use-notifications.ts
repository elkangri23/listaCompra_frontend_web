import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification-service';

export const useNotifications = (page: number = 1, limit: number = 10) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => notificationService.getNotifications(page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });

  const unreadNotificationsCountQuery = useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: async () => {
      const allNotifications = await notificationService.getNotifications(1, 1000); // Fetch a large number to count unread
      return allNotifications.data.filter(n => !n.read).length;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    notifications: data?.data || [],
    pagination: data?.meta,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    unreadCount: unreadNotificationsCountQuery.data || 0,
    isLoadingUnreadCount: unreadNotificationsCountQuery.isLoading,
  };
};
