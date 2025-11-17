import { useQuery } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';

export const useCollaborators = (listId: string) => {
  return useQuery({
    queryKey: ['collaborators', listId],
    queryFn: () => invitationService.getInvitationsByList(listId),
    enabled: !!listId,
    staleTime: 30000, // Cache for 30 seconds
  });
};
