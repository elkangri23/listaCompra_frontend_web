import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';
import { toast } from 'sonner';

interface RevokeAccessVariables {
  listId: string;
  userId: string;
}

export const useRevokeAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, userId }: RevokeAccessVariables) =>
      invitationService.revokePermission(listId, userId),
    onSuccess: (_, variables) => {
      toast.success('Acceso revocado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['collaborators', variables.listId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al revocar el acceso.';
      toast.error(errorMessage);
    },
  });
};
