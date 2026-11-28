/**
 * Tests - Panel de administración (/admin, fase 2): shell con las 7 pestañas.
 * Estado y Usuarios muestran contenido real del backend; el resto sigue
 * con el estado vacío honesto.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '@/app/(auth)/admin/page';
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

const TAB_LABELS = [
  'Estado',
  'Usuarios',
  'IA',
  'Auditoría',
  'Seguridad',
  'Copias',
  'Métricas',
];

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

const mockUsers = {
  usuarios: [
    {
      id: 'user-1',
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      rol: 'USUARIO',
      activo: true,
      emailVerificado: true,
      fechaCreacion: '2025-11-01T10:00:00.000Z',
      fechaActualizacion: '2025-11-20T10:00:00.000Z',
      listasCreadas: 3,
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const renderPage = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminPage />, { wrapper });
};

describe('Panel de administración (fase 2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (adminService.getHealthStatus as jest.Mock).mockResolvedValue(mockHealth);
    (adminService.getAlerts as jest.Mock).mockResolvedValue(mockAlerts);
    (adminService.getSystemMetrics as jest.Mock).mockResolvedValue(mockMetrics);
    (adminService.getPerformanceMetrics as jest.Mock).mockResolvedValue(mockPerformance);
    (adminService.getAdminUsers as jest.Mock).mockResolvedValue(mockUsers);
  });

  it('muestra el título y las 7 pestañas', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /administración/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    for (const label of TAB_LABELS) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    }
  });

  it('muestra la pestaña Estado por defecto con el contenido real', async () => {
    renderPage();

    expect(screen.getByRole('tab', { name: 'Estado' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await waitFor(() =>
      expect(screen.getByText('✓ Todo en orden')).toBeInTheDocument()
    );
    expect(screen.getByText('Peticiones totales')).toBeInTheDocument();
    expect(
      screen.queryByText(/próximamente: esta sección llega en la siguiente fase/i),
    ).not.toBeInTheDocument();
  });

  it('la pestaña Usuarios muestra la gestión integrada', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'Usuarios' }));

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Buscar usuarios por nombre o email'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/próximamente: esta sección llega en la siguiente fase/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /abrir la gestión de usuarios/i }),
    ).not.toBeInTheDocument();
  });

  it.each(TAB_LABELS.filter((label) => !['Estado', 'Usuarios'].includes(label)))(
    'la pestaña %s muestra el estado vacío',
    (label) => {
      renderPage();

      fireEvent.click(screen.getByRole('tab', { name: label }));

      expect(
        screen.getByText(/próximamente: esta sección llega en la siguiente fase/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: label }),
      ).toBeInTheDocument();
    },
  );
});
