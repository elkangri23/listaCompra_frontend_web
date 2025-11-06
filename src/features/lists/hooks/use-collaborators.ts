import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collaboratorService } from '../services/collaborator-service';
import { RemoveCollaboratorDto, UpdateCollaboratorRoleDto } from '@/types/Collaborator.types';

export const useCollaborators = (listId: string) => {
  return useQuery({
    queryKey: ['lists', listId, 'collaborators'],
    queryFn: () => collaboratorService.getCollaborators(listId),
    enabled: !!listId,
  });
};

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveCollaboratorDto) =>
      collaboratorService.removeCollaborator(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lists', variables.listId, 'collaborators'],
      });
      queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] });
    },
  });
};

export const useUpdateCollaboratorRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCollaboratorRoleDto) =>
      collaboratorService.updateCollaboratorRole(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lists', variables.listId, 'collaborators'],
      });
    },
  });
};
