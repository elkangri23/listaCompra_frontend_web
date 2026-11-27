import { axiosInstance } from '@/lib/api/axios-instance';
import {
  CategoriesListResponseDto,
  GetCategoriesByStoreDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoryDto,
  ToggleCategoryStatusDto,
  MoveCategoryToStoreDto,
  CategoryResponseDto,
} from '@/types/dtos/categories';

// El backend envuelve todas las respuestas en { success, message, data }.
// Los servicios deben devolver el contenido de `data`, no el sobre entero.
type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const getCategories = async (
  params?: GetCategoriesByStoreDto
): Promise<CategoriesListResponseDto> => {
  const response = await axiosInstance.get<
    ApiEnvelope<CategoriesListResponseDto>
  >('/categories', {
    params,
  });

  return response.data.data;
};

const createCategory = async (
  dto: CreateCategoryDto
): Promise<CategoryResponseDto> => {
  const response = await axiosInstance.post<ApiEnvelope<CategoryResponseDto>>(
    '/categories',
    dto
  );
  return response.data.data;
};

const updateCategory = async (
  dto: UpdateCategoryDto
): Promise<CategoryResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.put<ApiEnvelope<CategoryResponseDto>>(
    `/categories/${id}`,
    data
  );
  return response.data.data;
};

const deleteCategory = async (dto: DeleteCategoryDto): Promise<void> => {
  await axiosInstance.delete(`/categories/${dto.id}`);
};

const toggleCategoryStatus = async (
  dto: ToggleCategoryStatusDto
): Promise<CategoryResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.patch<ApiEnvelope<CategoryResponseDto>>(
    `/categories/${id}/toggle-status`,
    data
  );
  return response.data.data;
};

const moveCategoryToStore = async (
  dto: MoveCategoryToStoreDto
): Promise<CategoryResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.put<ApiEnvelope<CategoryResponseDto>>(
    `/categories/${id}/move-to-store`,
    data
  );
  return response.data.data;
};

const getCategoryById = async (
  id: string
): Promise<CategoryResponseDto> => {
  const response = await axiosInstance.get<ApiEnvelope<CategoryResponseDto>>(
    `/categories/${id}`
  );
  return response.data.data;
};

export const categoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  moveCategoryToStore,
};
