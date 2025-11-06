import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/category-service';
import { GetCategoriesByStoreDto } from '@/types/dtos/categories';

export const useCategories = (params?: GetCategoriesByStoreDto) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
  });
};
