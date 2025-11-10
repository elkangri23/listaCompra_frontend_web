import { axiosInstance } from '@/lib/api/axios-instance';
import { PaginatedResponse } from '@/types/PaginatedResponse.types';

/**
 * Servicio ligero para llamadas relacionadas con administración (usuarios, logs, etc.)
 * Se deja intencionalmente simple: devuelve la estructura paginada que la API suele ofrecer.
 */
export const getAdminUsers = async (
  query?: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<any>> => {
  const response = await axiosInstance.get<PaginatedResponse<any>>('/admin/users', {
    params: { q: query, page, limit },
  });

  return response.data;
};

export const updateUserStatus = async (
  userId: string,
  status: 'Activo' | 'Inactivo'
): Promise<void> => {
  await axiosInstance.patch(`/admin/users/${userId}/status`, { status });
};

export const getAuditLogs = async (
  page = 1,
  limit = 20
): Promise<PaginatedResponse<any>> => {
  const response = await axiosInstance.get<PaginatedResponse<any>>('/admin/audit-logs', {
    params: { page, limit },
  });

  return response.data;
};

export const adminService = {
  getAdminUsers,
  updateUserStatus,
  getAuditLogs,
};
