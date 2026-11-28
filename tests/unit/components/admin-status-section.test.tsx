/**
 * Tests - AdminStatusSection: pestaña Estado del panel (/admin, fase 2).
 * Salud, alertas y métricas reales del backend con skeletons y errores.
 */
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminStatusSection } from '@/features/admin/components/admin-status-section';
import { adminService } from '@/features/admin/services/admin-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/admin/services/admin-service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockHealth = {
  overall: 'healthy',
  services: { api: 'healthy', cache: 'healthy', metrics: 'healthy' },
  uptime: 3600000,
  timestamp: '2025-11-28T10:00:00.000Z',
};

const mockAlerts = {
  activeAlerts: [],
  alertCount: 0,
  timestamp: '2025-11-28T10:00:00.000Z',
};

const mockMetrics = {
  systemMetrics: {
    totalEndpoints: 12,
    globalRequestCount: 1250,
    globalSuccessRate: 98.4,
    globalAvgResponseTime: 125.5,
    uptime: 3600000,
    startTime: '2025-11-28T09:00:00.000Z',
  },
  endpointMetrics: [],
  cacheMetrics: null,
};

const mockPerformance = {
  slowestEndpoints: [],
  errorProneEndpoints: [],
  errorRateStats: [],
  timestamp: '2025-11-28T10:00:00.000Z',
};

const renderSection = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminStatusSection />, { wrapper });
};

describe('AdminStatusSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (adminService.getHealthStatus as jest.Mock).mockResolvedValue(mockHealth);
    (adminService.getAlerts as jest.Mock).mockResolvedValue(mockAlerts);
    (adminService.getSystemMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (adminService.getPerformanceMetrics as jest.Mock).mockResolvedValue(mockPerformance);
  });

  it('muestra la salud, las alertas y las métricas reales', async () => {
    renderSection();

    await waitFor(() => expect(screen.getByText('✓ Todo en orden')).toBeInTheDocument());
    expect(screen.getByText('Ninguna alerta activa.')).toBeInTheDocument();
    expect(screen.getByText('Peticiones totales')).toBeInTheDocument();
    expect(screen.getByText('1250')).toBeInTheDocument();
    expect(screen.getByText('En marcha desde hace 1 h')).toBeInTheDocument();
  });

  it('muestra skeletons mientras cargan la salud y las métricas', () => {
    (adminService.getHealthStatus as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    (adminService.getSystemMetrics as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    renderSection();

    expect(screen.getByLabelText('Cargando estado del sistema…')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargando métricas…')).toBeInTheDocument();
  });

  it('muestra un mensaje honesto si falla la salud', async () => {
    (adminService.getHealthStatus as jest.Mock).mockRejectedValue(
      new Error('Error del servidor')
    );

    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('No se pudo cargar el estado del sistema.')
      ).toBeInTheDocument()
    );
    // Las métricas se siguen viendo aunque falle la salud
    expect(await screen.findByText('Peticiones totales')).toBeInTheDocument();
  });

  it('muestra un mensaje honesto si fallan las métricas', async () => {
    (adminService.getSystemMetrics as jest.Mock).mockRejectedValue(
      new Error('Error del servidor')
    );

    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('No se pudieron cargar las métricas del sistema.')
      ).toBeInTheDocument()
    );
    expect(await screen.findByText('✓ Todo en orden')).toBeInTheDocument();
  });
});
