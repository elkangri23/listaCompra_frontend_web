import { axiosInstance } from '@/lib/api/axios-instance';
import { cacheAnalyticsService } from '@/features/settings/services/cache-analytics-service';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: { get: jest.fn() },
}));

const mockGet = axiosInstance.get as jest.Mock;

describe('cacheAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('desenvuelve la analítica en tiempo real ({success, data})', async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          hits: 80,
          misses: 20,
          hitRatio: 0.8,
          averageResponseTime: 12,
          cacheResponseTime: 5,
          apiResponseTime: 120,
          totalOperations: 100,
          readsPerMinute: 20,
          writesPerMinute: 2,
          costSavings: 80,
          spaceSavings: 1.5,
          categoryStats: {},
          timestamp: '2026-11-26T17:00:00.000Z',
          window: '5 minutes',
        },
      },
    });

    const result = await cacheAnalyticsService.getCacheRealtime();

    expect(mockGet).toHaveBeenCalledWith('/analytics/cache/realtime');
    expect(result.hitRatio).toBe(0.8);
    expect(result.costSavings).toBe(80);
  });
});
