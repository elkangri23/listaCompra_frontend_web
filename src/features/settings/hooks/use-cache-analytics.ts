import { useQuery } from '@tanstack/react-query';
import { cacheAnalyticsService } from '../services/cache-analytics-service';

export const useCacheAnalytics = () => {
  return useQuery({
    queryKey: ['settings', 'cache-analytics', 'realtime'],
    queryFn: () => cacheAnalyticsService.getCacheRealtime(),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};
