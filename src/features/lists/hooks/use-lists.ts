import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listService } from '../services/list-service';
import { CreateListDto, UpdateListDto } from '@/types/dtos/lists';

export const useLists = (query?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['lists', query, page, limit],
    queryFn: () => listService.getLists(query, page, limit),
    staleTime: 0, // Considerar los datos como stale inmediatamente
    refetchOnMount: true, // Siempre refetch cuando el componente se monta
    refetchOnWindowFocus: true, // Refetch cuando la ventana recupera el foco
  });
};

export const useList = (id: string) => {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => listService.getListById(id),
    enabled: !!id,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListDto) => listService.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listService.deleteList(id),
    onSuccess: (_data, id) => {
      // Invalidar queries de listas
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      // Eliminar queries específicas de la lista eliminada
      queryClient.removeQueries({ queryKey: ['lists', id] });
      // Eliminar queries de productos de esa lista
      queryClient.removeQueries({ queryKey: ['products', id] });
    },
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListDto }) =>
      listService.updateList(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', variables.id] });
    },
  });
};

export const useListSummary = (id: string) => {
  return useQuery({
    queryKey: ['lists', id, 'summary'],
    queryFn: () => listService.getListSummary(id),
    enabled: !!id,
  });
};