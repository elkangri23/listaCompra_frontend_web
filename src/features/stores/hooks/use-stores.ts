import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService } from '../services/store-service';
import { GetStoresDto } from '@/types/dtos/stores';

export const useStores = (params?: GetStoresDto) => {
  return useQuery({
    queryKey: ['stores', params],
    queryFn: () => storeService.getStores(params),
  });
};

export const useStore = (id: string) => {
  return useQuery({
    queryKey: ['stores', id],
    queryFn: () => storeService.getStoreById(id),
    enabled: !!id,
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeService.createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeService.updateStore,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores', data.id] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeService.deleteStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
};

export const useToggleStoreStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeService.toggleStoreStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores', data.id] });
    },
  });
};
