import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listService } from '../services/list-service';
import { CreateListDto, UpdateListDto } from '@/types/dtos/lists';

export const useLists = (query?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['lists', query, page, limit],
    queryFn: () => listService.getLists(query, page, limit),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
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