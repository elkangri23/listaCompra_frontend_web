import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/audit-service';
import { AuditHistoryFilters } from '../types';

export const useListAuditHistory = (
  listId: string,
  filters: AuditHistoryFilters = {},
) => {
  return useQuery({
    queryKey: ['audit', 'lists', listId, filters],
    queryFn: () => auditService.getListAuditHistory(listId, filters),
    enabled: !!listId,
  });
};

export const useListCollaborators = (listId: string) => {
  return useQuery({
    queryKey: ['audit', 'collaborators', listId],
    queryFn: () => auditService.getListCollaborators(listId),
    enabled: !!listId,
    staleTime: 30000,
  });
};
