import { useQuery } from '@tanstack/react-query';
import { systemStatusService } from '../services/system-status-service';

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system-status', 'health'],
    queryFn: () => systemStatusService.getSystemHealth(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useSystemAlerts = () => {
  return useQuery({
    queryKey: ['system-status', 'alerts'],
    queryFn: () => systemStatusService.getSystemAlerts(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};
