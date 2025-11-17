import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (invitationId: string) => invitationService.acceptInvitation(invitationId),
    onSuccess: (data, invitationId) => {
      toast.success('¡Te has unido a la lista!');
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
      // We don't have the listId here, so we can't redirect to the list
      // We will redirect to the dashboard instead
      router.push('/dashboard');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Error al aceptar la invitación.';
      toast.error(errorMessage);
    },
  });
};
