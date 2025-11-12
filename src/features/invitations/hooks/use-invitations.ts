import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';
import { UpdatePermissionsDto } from '@/types/dtos/invitations';

export const usePendingInvitations = () => {
  return useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: invitationService.getPendingInvitations,
  });
};

export const useInvitationByHash = (hash: string) => {
  return useQuery({
    queryKey: ['invitations', 'hash', hash],
    queryFn: () => invitationService.getInvitationByHash(hash),
    enabled: !!hash,
  });
};

export const useInvitationsByList = (listId: string) => {
  return useQuery({
    queryKey: ['invitations', 'list', listId],
    queryFn: () => invitationService.getInvitationsByList(listId),
    enabled: !!listId,
  });
};

export const useInviteUser = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => invitationService.inviteUser(listId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'list', listId] });
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

export const useUpdatePermissions = (listId: string, userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdatePermissionsDto) =>
      invitationService.updatePermissions(listId, userId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'list', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists', listId] });
    },
  });
};
