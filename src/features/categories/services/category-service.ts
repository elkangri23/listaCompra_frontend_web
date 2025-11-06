import { axiosInstance } from '@/lib/api/axios-instance';
import {
  CategoriesListResponseDto,
  GetCategoriesByStoreDto,
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

export const categoryService = {
  getCategories,
};
