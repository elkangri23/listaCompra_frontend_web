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

export const adminService = {
  getAdminUsers,
};
