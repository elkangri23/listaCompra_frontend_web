import { axiosInstance } from '@/lib/api/axios-instance';
import {
  CreateStoreDto,
  UpdateStoreDto,
  DeleteStoreDto,
  ToggleStoreStatusDto,
  StoreResponseDto,
  StoresListResponseDto,
  GetStoresDto,
} from '@/types/dtos/stores';
import { CategoriesListResponseDto } from '@/types/dtos/categories';

const createStore = async (dto: CreateStoreDto): Promise<StoreResponseDto> => {
  const response = await axiosInstance.post<StoreResponseDto>('/stores', dto);
  return response.data;
};

const getStores = async (params?: GetStoresDto): Promise<StoresListResponseDto> => {
  const response = await axiosInstance.get<StoresListResponseDto>('/stores', { params });
  return response.data;
};

const getStoreById = async (id: string): Promise<StoreResponseDto> => {
  const response = await axiosInstance.get<StoreResponseDto>(`/stores/${id}`);
  return response.data;
};

const updateStore = async (dto: UpdateStoreDto): Promise<StoreResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.put<StoreResponseDto>(`/stores/${id}`, data);
  return response.data;
};

const deleteStore = async (dto: DeleteStoreDto): Promise<void> => {
  await axiosInstance.delete(`/stores/${dto.id}`);
};

const toggleStoreStatus = async (dto: ToggleStoreStatusDto): Promise<StoreResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.patch<StoreResponseDto>(`/stores/${id}/toggle-status`, data);
  return response.data;
};

const getStoreCategories = async (id: string): Promise<CategoriesListResponseDto> => {
  const response = await axiosInstance.get<CategoriesListResponseDto>(`/stores/${id}/categories`);
  return response.data;
};

export const storeService = {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  toggleStoreStatus,
  getStoreCategories,
};
