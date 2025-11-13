import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category-service';
import { GetCategoriesByStoreDto } from '@/types/dtos/categories';

export const useCategories = (params?: GetCategoriesByStoreDto) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.toggleCategoryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useMoveCategoryToStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.moveCategoryToStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
