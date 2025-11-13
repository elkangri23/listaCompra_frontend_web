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

const getCategories = async (
  params?: GetCategoriesByStoreDto
): Promise<CategoriesListResponseDto> => {
  const response = await axiosInstance.get<CategoriesListResponseDto>(
    '/categories',
    {
      params,
    }
  );

  return response.data;
};

const createCategory = async (
  dto: CreateCategoryDto
): Promise<CategoryResponseDto> => {
  const response = await axiosInstance.post<CategoryResponseDto>(
    '/categories',
    dto
  );
  return response.data;
};

const updateCategory = async (
  dto: UpdateCategoryDto
): Promise<CategoryResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.put<CategoryResponseDto>(
    `/categories/${id}`,
    data
  );
  return response.data;
};

const deleteCategory = async (dto: DeleteCategoryDto): Promise<void> => {
  await axiosInstance.delete(`/categories/${dto.id}`);
};

const toggleCategoryStatus = async (
  dto: ToggleCategoryStatusDto
): Promise<CategoryResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.patch<CategoryResponseDto>(
    `/categories/${id}/toggle-status`,
    data
  );
  return response.data;
};

const moveCategoryToStore = async (
  dto: MoveCategoryToStoreDto
): Promise<CategoryResponseDto> => {
  const { id, ...data } = dto;
  const response = await axiosInstance.put<CategoryResponseDto>(
    `/categories/${id}/move-to-store`,
    data
  );
  return response.data;
};

const getCategoryById = async (
  id: string
): Promise<CategoryResponseDto> => {
  const response = await axiosInstance.get<CategoryResponseDto>(`/categories/${id}`);
  return response.data;
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
