import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin-service';

export const useAdminUsers = (query?: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'users', query, page, limit],
    queryFn: () => adminService.getAdminUsers(query, page, limit),
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'Activo' | 'Inactivo' }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAuditLogs = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page, limit],
    queryFn: () => adminService.getAuditLogs(page, limit),
  });
};
