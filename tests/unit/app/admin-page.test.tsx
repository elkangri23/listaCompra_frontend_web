/**
 * Tests - Panel de administración (/admin, fase 5): shell con las 7 pestañas.
 * Estado, Usuarios, IA, Auditoría y Seguridad muestran contenido real del
 * backend; el resto sigue con el estado vacío honesto.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '@/app/(auth)/admin/page';
import { adminService } from '@/features/admin/services/admin-service';
import { aiSettingsService } from '@/features/settings/services/ai-settings-service';
import { cacheAnalyticsService } from '@/features/settings/services/cache-analytics-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/admin/services/admin-service');
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'user-1', name: 'Antonio', email: 'antonio@example.com' } },
    status: 'authenticated',
  })),
}));
jest.mock('@/features/settings/services/ai-settings-service', () => ({
  AI_PROVIDERS: [
    {
      id: 'freellmapi',
      nombre: 'FreeLLMAPI (gratuito, local)',
      apiUrlPorDefecto: 'http://freellmapi:3001/v1',
      modelosSugeridos: ['qwen3.8-27b', 'gemini-3.5-flash-lite'],
    },
  ],
  aiSettingsService: {
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
    testConfig: jest.fn(),
  },
}));
jest.mock('@/features/settings/services/cache-analytics-service', () => ({
  cacheAnalyticsService: {
    getCacheRealtime: jest.fn(),
  },
}));
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

const mockAIConfig = {
  provider: 'freellmapi',
  apiUrl: 'http://freellmapi:3001/v1',
  model: 'qwen3.8-27b',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000,
  cache: { enabled: true, ttl: 3600 },
  rateLimit: { requestsPerMinute: 30 },
  apiKeyConfigured: true,
  apiKeyMasked: '****1234',
};

const mockAIHealth = {
  status: 'healthy',
  provider: 'freellmapi',
  model: 'qwen3.8-27b',
  latencyMs: 225,
  checkedAt: '2025-11-28T10:00:00.000Z',
  cached: false,
};

const mockAIUsage = {
  provider: 'freellmapi',
  model: 'qwen3.8-27b',
  today: {
    total: 12,
    byOperation: {
      'category-suggestions': 10,
      'bulk-categorize': 1,
      'config-test': 1,
    },
    success: 11,
    failed: 1,
    avgLatencyMs: 225,
    cached: 4,
    cachedPercentage: 33.3,
  },
  last7Days: [
    {
      date: '2025-11-28',
      total: 12,
      success: 11,
      failed: 1,
      byOperation: {
        'category-suggestions': 10,
        'bulk-categorize': 1,
        'config-test': 1,
      },
    },
  ],
  hasData: true,
};

const mockCacheAnalytics = {
  hits: 80,
  misses: 20,
  hitRatio: 0.8,
  averageResponseTime: 45,
  cacheResponseTime: 12,
  apiResponseTime: 180,
  totalOperations: 100,
  readsPerMinute: 50,
  writesPerMinute: 10,
  costSavings: 80,
  spaceSavings: 12.5,
  categoryStats: {},
  timestamp: '2025-11-28T10:00:00.000Z',
  window: '5m',
};

const mockAuditLogs = {
  entries: [
    {
      id: 'e1',
      entityType: 'Producto',
      entityId: 'p1',
      changeType: 'UPDATE',
      changedByUserId: 'user-1',
      timestamp: '2026-11-26T15:27:21.148Z',
      changedFields: ['comprado', 'fechaCompra'],
      oldValue: { comprado: false, nombre: 'Leche' },
      newValue: { comprado: true, nombre: 'Leche' },
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const mockSecurityOverview = {
  twoFactor: { enabled: 1, total: 3 },
  failedLoginsLast24h: 4,
  turnstile: { enabled: true },
  gracePeriod: { count: 0, accounts: [] },
  unavailable: {},
};

const mockSecurityAlerts = {
  alerts: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

const mockLoginAttempts = {
  attempts: [
    {
      id: 'att-1',
      email: 'ana@ejemplo.com',
      success: true,
      reason: null,
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      createdAt: '2026-11-28T10:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 10,
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
    (aiSettingsService.getConfig as jest.Mock).mockResolvedValue(mockAIConfig);
    (adminService.getAIHealth as jest.Mock).mockResolvedValue(mockAIHealth);
    (adminService.getAIUsage as jest.Mock).mockResolvedValue(mockAIUsage);
    (cacheAnalyticsService.getCacheRealtime as jest.Mock).mockResolvedValue(
      mockCacheAnalytics
    );
    (adminService.getAuditLogs as jest.Mock).mockResolvedValue(mockAuditLogs);
    (adminService.getSecurityOverview as jest.Mock).mockResolvedValue(
      mockSecurityOverview
    );
    (adminService.getSecurityAlerts as jest.Mock).mockResolvedValue(
      mockSecurityAlerts
    );
    (adminService.getLoginAttempts as jest.Mock).mockResolvedValue(
      mockLoginAttempts
    );
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

  it('la pestaña IA muestra la sección real', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'IA' }));

    expect(await screen.findByText('FreeLLMAPI (gratuito, local)')).toBeInTheDocument();
    expect(screen.getByText('Proveedor activo')).toBeInTheDocument();
    expect(screen.getByText('Sugerencias de categoría')).toBeInTheDocument();
    expect(screen.getByText('80 aciertos · 20 fallos')).toBeInTheDocument();
    expect(
      screen.queryByText(/próximamente: esta sección llega en la siguiente fase/i),
    ).not.toBeInTheDocument();
  });

  it('la pestaña Auditoría muestra la sección real', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'Auditoría' }));

    expect(await screen.findByText('Cambios en la aplicación')).toBeInTheDocument();
    expect(screen.getByText('Tú marcaste como comprado Leche')).toBeInTheDocument();
    expect(
      screen.queryByText(/próximamente: esta sección llega en la siguiente fase/i),
    ).not.toBeInTheDocument();
  });

  it('la pestaña Seguridad muestra la sección real', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('tab', { name: 'Seguridad' }));

    expect(await screen.findByText('Cuentas con 2FA')).toBeInTheDocument();
    expect(screen.getByText('Últimos inicios de sesión')).toBeInTheDocument();
    expect(screen.getByText('ana@ejemplo.com')).toBeInTheDocument();
    expect(
      screen.queryByText(/próximamente: esta sección llega en la siguiente fase/i),
    ).not.toBeInTheDocument();
  });

  it.each(
    TAB_LABELS.filter(
      (label) => !['Estado', 'Usuarios', 'IA', 'Auditoría', 'Seguridad'].includes(label)
    )
  )(
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
