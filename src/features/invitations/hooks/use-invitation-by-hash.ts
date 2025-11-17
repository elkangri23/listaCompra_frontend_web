import { useQuery } from '@tanstack/react-query';
import { invitationService } from '../services/invitation-service';

export const useInvitationByHash = (hash: string) => {
  return useQuery({
    queryKey: ['invitation', hash],
    queryFn: () => invitationService.getInvitationByHash(hash),
    enabled: !!hash, // Only run the query if the hash is not empty
    retry: false, // Don't retry on error, as 404/410 are expected outcomes
  });
};
