import { axiosInstance } from '@/lib/api/axios-instance';
import { CreateListDto, UpdateListDto } from '@/types/dtos/lists';
import { Lista } from '@/types/Lista.types';

const getLists = async (): Promise<Lista[]> => {
  const response = await axiosInstance.get<Lista[]>('/lists');
  return response.data;
};

const getListById = async (id: string): Promise<Lista> => {
  const response = await axiosInstance.get<Lista>(`/lists/${id}`);
  return response.data;
};

const createList = async (data: CreateListDto): Promise<Lista> => {
  const response = await axiosInstance.post<Lista>('/lists', data);
  return response.data;
};

const updateList = async (id: string, data: UpdateListDto): Promise<Lista> => {
  const response = await axiosInstance.put<Lista>(`/lists/${id}`, data);
  return response.data;
};

const deleteList = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/lists/${id}`);
};

export const listService = {
  getLists,
  getListById,
  createList,
  updateList,
  deleteList,
};