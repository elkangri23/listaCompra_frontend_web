import { axiosInstance } from '@/lib/api/axios-instance';
import { systemStatusService } from '@/features/system-status/services/system-status-service';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: { get: jest.fn() },
}));

const mockGet = axiosInstance.get as jest.Mock;

describe('systemStatusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('desenvuelve la salud ({status, data})', async () => {
    mockGet.mockResolvedValue({
      data: {
        status: 'success',
        data: {
          overall: 'healthy',
          services: { api: 'healthy', cache: 'healthy', metrics: 'healthy' },
          uptime: 3600,
          timestamp: '2026-11-26T17:00:00.000Z',
        },
      },
    });

    const result = await systemStatusService.getSystemHealth();

    expect(mockGet).toHaveBeenCalledWith('/dashboard/health');
    expect(result.overall).toBe('healthy');
    expect(result.uptime).toBe(3600);
  });

  it('desenvuelve las alertas activas', async () => {
    mockGet.mockResolvedValue({
      data: {
        status: 'success',
        data: {
          activeAlerts: [
            {
              type: 'error_rate',
              severity: 'high',
              message: 'Error rate is high: 15.0%',
              value: 0.15,
              threshold: 0.1,
              timestamp: '2026-11-26T17:00:00.000Z',
            },
          ],
          alertCount: 1,
          timestamp: '2026-11-26T17:00:00.000Z',
        },
      },
    });

    const result = await systemStatusService.getSystemAlerts();

    expect(mockGet).toHaveBeenCalledWith('/dashboard/alerts');
    expect(result.alertCount).toBe(1);
    expect(result.activeAlerts[0].message).toContain('15.0%');
  });
});
