import { axiosInstance } from '@/lib/api/axios-instance';
import { CreateListDto, UpdateListDto } from '@/types/dtos/lists';
import { Lista, ListSummary } from '@/types/Lista.types';

import { PaginatedResponse } from '@/types/PaginatedResponse.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const getLists = async (
  query?: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Lista>> => {
  const response = await axiosInstance.get<PaginatedResponse<Lista>>(
    '/lists',
    {
      params: { q: query, page, limit },
    }
  );
  return response.data;
};

const getListById = async (id: string): Promise<Lista> => {
  const response = await axiosInstance.get<ApiResponse<Lista>>(`/lists/${id}`);
  return response.data.data;
};

const createList = async (data: CreateListDto): Promise<Lista> => {
  const response = await axiosInstance.post<ApiResponse<Lista>>('/lists', data);
  return response.data.data;
};

const updateList = async (id: string, data: UpdateListDto): Promise<Lista> => {
  const response = await axiosInstance.put<ApiResponse<Lista>>(`/lists/${id}`, data);
  return response.data.data;
};

const deleteList = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/lists/${id}`);
};

const getListSummary = async (id: string): Promise<ListSummary> => {
  const response = await axiosInstance.get<ListSummary>(`/lists/${id}/summary`);
  return response.data;
};

export const listService = {
  getLists,
  getListById,
  createList,
  updateList,
  deleteList,
  getListSummary,
};