import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';
import { toast } from 'sonner';

interface UpdatePermissionsVariables {
  listId: string;
  userId: string;
  permissions: string[];
}

export const useUpdatePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, userId, permissions }: UpdatePermissionsVariables) =>
      invitationService.updatePermissions(listId, userId, { permissions }),
    onSuccess: (_, variables) => {
      toast.success('Permisos actualizados correctamente.');
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.listId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al actualizar los permisos.';
      toast.error(errorMessage);
    },
  });
};
