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

// El backend envuelve todas las respuestas en { success, message, data }.
// Los servicios deben devolver el contenido de `data`, no el sobre entero.
type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const createStore = async (dto: CreateStoreDto): Promise<StoreResponseDto> => {
  const response = await axiosInstance.post<ApiEnvelope<StoreResponseDto>>(
    '/stores',
    dto
  );
  return response.data.data;
};

const getStores = async (params?: GetStoresDto): Promise<StoresListResponseDto> => {
  const response = await axiosInstance.get<ApiEnvelope<StoresListResponseDto>>(
    '/stores',
    { params }
  );
  return response.data.data;
};

const getStoreById = async (id: string): Promise<StoreResponseDto> => {
  const response = await axiosInstance.get<ApiEnvelope<StoreResponseDto>>(
    `/stores/${id}`
  );
  return response.data.data;
};

const updateStore = async (dto: UpdateStoreDto): Promise<StoreResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.put<ApiEnvelope<StoreResponseDto>>(
    `/stores/${id}`,
    data
  );
  return response.data.data;
};

const deleteStore = async (dto: DeleteStoreDto): Promise<void> => {
  await axiosInstance.delete(`/stores/${dto.id}`);
};

const toggleStoreStatus = async (
  dto: ToggleStoreStatusDto
): Promise<StoreResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.patch<ApiEnvelope<StoreResponseDto>>(
    `/stores/${id}/toggle-status`,
    data
  );
  return response.data.data;
};

const getStoreCategories = async (id: string): Promise<CategoriesListResponseDto> => {
  const response = await axiosInstance.get<
    ApiEnvelope<CategoriesListResponseDto>
  >(`/stores/${id}/categories`);
  return response.data.data;
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
