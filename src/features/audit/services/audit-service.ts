import { axiosInstance } from '@/lib/api/axios-instance';
import {
  AuditHistoryFilters,
  AuditHistoryResponse,
  ListCollaboratorDto,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const getListAuditHistory = async (
  listId: string,
  filters: AuditHistoryFilters = {},
): Promise<AuditHistoryResponse> => {
  const params: Record<string, unknown> = {
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 10,
  };
  if (filters.changeType) params.changeType = filters.changeType;
  if (filters.changedByUserId) params.changedByUserId = filters.changedByUserId;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  const response = await axiosInstance.get<ApiResponse<AuditHistoryResponse>>(
    `/audit/lists/${listId}`,
    { params },
  );
  return response.data.data;
};

const getListCollaborators = async (
  listId: string,
): Promise<ListCollaboratorDto[]> => {
  // El endpoint devuelve el array directamente, sin envoltorio { data }.
  const response = await axiosInstance.get<ListCollaboratorDto[]>(
    `/lists/${listId}/collaborators`,
  );
  return response.data;
};

export const auditService = {
  getListAuditHistory,
  getListCollaborators,
};
