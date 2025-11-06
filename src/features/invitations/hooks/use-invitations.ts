import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';
import { InviteUserFormValues } from '../components/invite-user-form';

export const usePendingInvitations = () => {
  return useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: invitationService.getPendingInvitations,
  });
};

export const useInviteUser = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserFormValues) =>
      invitationService.inviteUser(listId, data.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', listId] });
      // Optionally invalidate a query for active invitations if one exists
      queryClient.invalidateQueries({ queryKey: ['invitations', listId] });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationService.acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationService.declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
    },
  });
};
