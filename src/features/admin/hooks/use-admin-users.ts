import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin-service';

export const useAdminUsers = (query?: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'users', query, page, limit],
    queryFn: () => adminService.getAdminUsers(query, page, limit),
  });
};
