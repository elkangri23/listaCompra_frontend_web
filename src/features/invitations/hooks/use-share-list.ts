import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';
import { GenerateShareLinkDto } from '@/types/dtos/invitations';

export const useShareList = (listId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: GenerateShareLinkDto) =>
      invitationService.generateShareLink(listId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', 'list', listId] });
    },
  });
};
