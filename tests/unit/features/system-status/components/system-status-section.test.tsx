import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SystemStatusSection } from '@/features/system-status/components/system-status-section';
import { systemStatusService } from '@/features/system-status/services/system-status-service';

jest.mock('@/features/system-status/services/system-status-service', () => ({
  systemStatusService: {
    getSystemHealth: jest.fn(),
    getSystemAlerts: jest.fn(),
  },
}));

const mockGetHealth = systemStatusService.getSystemHealth as jest.Mock;
const mockGetAlerts = systemStatusService.getSystemAlerts as jest.Mock;

const healthy = {
  overall: 'healthy',
  services: { api: 'healthy', cache: 'healthy', metrics: 'healthy' },
  uptime: 5400,
  timestamp: '2026-11-26T17:00:00.000Z',
};

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SystemStatusSection />
    </QueryClientProvider>,
  );
}

describe('SystemStatusSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHealth.mockResolvedValue(healthy);
    mockGetAlerts.mockResolvedValue({ activeAlerts: [], alertCount: 0, timestamp: '' });
  });

  it('muestra Todo en orden y sin alertas cuando todo va bien', async () => {
    renderSection();

    expect(await screen.findByText('Todo en orden')).toBeInTheDocument();
    expect(screen.getByText('Sin alertas activas.')).toBeInTheDocument();
    expect(screen.getByText(/API: En orden · Caché: En orden/)).toBeInTheDocument();
    expect(screen.getByText(/1 h/)).toBeInTheDocument();
  });

  it('muestra las alertas activas cuando las hay', async () => {
    mockGetHealth.mockResolvedValue({
      ...healthy,
      overall: 'degraded',
      services: { api: 'degraded', cache: 'healthy', metrics: 'healthy' },
    });
    mockGetAlerts.mockResolvedValue({
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
    });
    renderSection();

    expect(await screen.findByText('El servicio tiene incidencias')).toBeInTheDocument();
    expect(screen.getByText('Error rate is high: 15.0%')).toBeInTheDocument();
    expect(screen.getByText('Degradado')).toBeInTheDocument();
  });

  it('no renderiza nada si la salud no responde', async () => {
    mockGetHealth.mockRejectedValue(new Error('caído'));
    const { container } = renderSection();

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
