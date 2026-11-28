/**
 * Tests - AdminAISection: pestaña IA del panel (/admin, fase 3).
 * Proveedor activo, uso real de IA y caché de IA, con skeletons y
 * mensajes honestos por bloque.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminAISection } from '@/features/admin/components/admin-ai-section';
import { adminService } from '@/features/admin/services/admin-service';
import { aiSettingsService } from '@/features/settings/services/ai-settings-service';
import { cacheAnalyticsService } from '@/features/settings/services/cache-analytics-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/admin/services/admin-service');
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

const mockConfig = {
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

const mockHealth = {
  status: 'healthy',
  provider: 'freellmapi',
  model: 'qwen3.8-27b',
  latencyMs: 225,
  checkedAt: '2026-11-28T10:00:00.000Z',
  cached: false,
};

const mockUsage = {
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
      date: '2026-11-22',
      total: 3,
      success: 3,
      failed: 0,
      byOperation: { 'category-suggestions': 3, 'bulk-categorize': 0, 'config-test': 0 },
    },
    {
      date: '2026-11-23',
      total: 0,
      success: 0,
      failed: 0,
      byOperation: { 'category-suggestions': 0, 'bulk-categorize': 0, 'config-test': 0 },
    },
    {
      date: '2026-11-24',
      total: 5,
      success: 5,
      failed: 0,
      byOperation: { 'category-suggestions': 5, 'bulk-categorize': 0, 'config-test': 0 },
    },
    {
      date: '2026-11-25',
      total: 2,
      success: 2,
      failed: 0,
      byOperation: { 'category-suggestions': 2, 'bulk-categorize': 0, 'config-test': 0 },
    },
    {
      date: '2026-11-26',
      total: 8,
      success: 7,
      failed: 1,
      byOperation: { 'category-suggestions': 7, 'bulk-categorize': 1, 'config-test': 0 },
    },
    {
      date: '2026-11-27',
      total: 1,
      success: 1,
      failed: 0,
      byOperation: { 'category-suggestions': 0, 'bulk-categorize': 0, 'config-test': 1 },
    },
    {
      date: '2026-11-28',
      total: 12,
      success: 11,
      failed: 1,
      byOperation: { 'category-suggestions': 10, 'bulk-categorize': 1, 'config-test': 1 },
    },
  ],
  hasData: true,
};

const mockCache = {
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
  timestamp: '2026-11-28T10:00:00.000Z',
  window: '5m',
};

const renderSection = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminAISection />, { wrapper });
};

describe('AdminAISection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (aiSettingsService.getConfig as jest.Mock).mockResolvedValue(mockConfig);
    (aiSettingsService.testConfig as jest.Mock).mockResolvedValue({
      provider: 'freellmapi',
      model: 'qwen3.8-27b',
      apiUrl: 'http://freellmapi:3001/v1',
      latencyMs: 180,
    });
    (adminService.getAIHealth as jest.Mock).mockResolvedValue(mockHealth);
    (adminService.getAIUsage as jest.Mock).mockResolvedValue(mockUsage);
    (cacheAnalyticsService.getCacheRealtime as jest.Mock).mockResolvedValue(mockCache);
  });

  it('muestra el proveedor activo, el uso real y la caché', async () => {
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('FreeLLMAPI (gratuito, local)')).toBeInTheDocument()
    );
    expect(screen.getByText('qwen3.8-27b')).toBeInTheDocument();
    expect(screen.getByText('gemini-3.5-flash-lite')).toBeInTheDocument();
    expect(screen.getByText('http://freellmapi:3001/v1')).toBeInTheDocument();
    expect(screen.getByText('En orden')).toBeInTheDocument();
    // Latencia media de hoy y última prueba: ambas 225 ms
    expect(screen.getAllByText(/225 ms/)).toHaveLength(2);
    expect(screen.getByText('Sugerencias de categoría')).toBeInTheDocument();
    expect(screen.getByText('Categorización en lote')).toBeInTheDocument();
    expect(screen.getByText('Pruebas de conexión')).toBeInTheDocument();
    expect(screen.getByText('28 nov')).toBeInTheDocument();
    expect(screen.getByText('80 %')).toBeInTheDocument();
    expect(screen.getByText('80 aciertos · 20 fallos')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /cambiar en ajustes → ia/i })
    ).toHaveAttribute('href', '/settings');
  });

  it('muestra skeletons mientras carga cada tarjeta', () => {
    (aiSettingsService.getConfig as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    (adminService.getAIUsage as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    (cacheAnalyticsService.getCacheRealtime as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    renderSection();

    expect(screen.getByLabelText('Cargando proveedor de IA…')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargando uso de IA…')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargando caché de IA…')).toBeInTheDocument();
  });

  it('muestra un mensaje honesto si falla la configuración de IA', async () => {
    (aiSettingsService.getConfig as jest.Mock).mockRejectedValue(
      new Error('Error del servidor')
    );

    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('No se pudo cargar la configuración de IA.')
      ).toBeInTheDocument()
    );
    // El uso y la caché se siguen viendo aunque falle el proveedor
    expect(await screen.findByText('Sugerencias de categoría')).toBeInTheDocument();
    expect(await screen.findByText('80 aciertos · 20 fallos')).toBeInTheDocument();
  });

  it('muestra la configuración aunque falle la salud de IA', async () => {
    (adminService.getAIHealth as jest.Mock).mockRejectedValue(
      new Error('Error del servidor')
    );

    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('No se pudo comprobar la salud de la IA ahora mismo.')
      ).toBeInTheDocument()
    );
    expect(screen.getByText('FreeLLMAPI (gratuito, local)')).toBeInTheDocument();
  });

  it('muestra la salud degradada con su motivo y la comprobación en caché', async () => {
    (adminService.getAIHealth as jest.Mock).mockResolvedValue({
      ...mockHealth,
      status: 'degraded',
      latencyMs: null,
      reason: 'Latencia alta en el proveedor',
      cached: true,
    });

    renderSection();

    await waitFor(() => expect(screen.getByText('Degradado')).toBeInTheDocument());
    expect(screen.getByText('Latencia alta en el proveedor')).toBeInTheDocument();
    expect(screen.getByText('Sí')).toBeInTheDocument();
    expect(screen.getByText('Sin datos aún')).toBeInTheDocument();
  });

  it('muestra el proveedor tal cual si no está en la lista conocida', async () => {
    (aiSettingsService.getConfig as jest.Mock).mockResolvedValue({
      ...mockConfig,
      provider: 'otro-proveedor',
    });

    renderSection();

    await waitFor(() =>
      expect(screen.getByText('otro-proveedor')).toBeInTheDocument()
    );
    expect(screen.getByText('Sin reserva')).toBeInTheDocument();
  });

  it('el botón Probar conexión muestra la latencia medida', async () => {
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('FreeLLMAPI (gratuito, local)')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Probar conexión' }));

    await waitFor(() =>
      expect(screen.getByText('180 ms · correcta')).toBeInTheDocument()
    );
    expect(aiSettingsService.testConfig).toHaveBeenCalledWith(undefined);
  });

  it('el botón Probar conexión muestra el error sin romper la tarjeta', async () => {
    (aiSettingsService.testConfig as jest.Mock).mockRejectedValue(
      new Error('No se pudo conectar con el proveedor')
    );

    renderSection();

    await waitFor(() =>
      expect(screen.getByText('FreeLLMAPI (gratuito, local)')).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: 'Probar conexión' }));

    await waitFor(() =>
      expect(
        screen.getByText('La prueba falló: No se pudo conectar con el proveedor')
      ).toBeInTheDocument()
    );
    expect(screen.getByText('FreeLLMAPI (gratuito, local)')).toBeInTheDocument();
  });

  it('muestra "Sin datos aún" si todavía no hay uso de IA', async () => {
    (adminService.getAIUsage as jest.Mock).mockResolvedValue({
      ...mockUsage,
      today: {
        total: 0,
        byOperation: {
          'category-suggestions': 0,
          'bulk-categorize': 0,
          'config-test': 0,
        },
        success: 0,
        failed: 0,
        avgLatencyMs: null,
        cached: 0,
        cachedPercentage: null,
      },
      last7Days: [],
      hasData: false,
    });

    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('Sin datos aún: todavía no hay peticiones de IA registradas.')
      ).toBeInTheDocument()
    );
  });

  it('muestra un mensaje honesto si falla el uso de IA', async () => {
    (adminService.getAIUsage as jest.Mock).mockRejectedValue(
      new Error('Error del servidor')
    );

    renderSection();

    await waitFor(() =>
      expect(screen.getByText('No se pudo cargar el uso de IA.')).toBeInTheDocument()
    );
    expect(await screen.findByText('FreeLLMAPI (gratuito, local)')).toBeInTheDocument();
  });

  it('muestra "Sin datos aún" en la caché si no hay operaciones', async () => {
    (cacheAnalyticsService.getCacheRealtime as jest.Mock).mockResolvedValue({
      ...mockCache,
      hits: 0,
      misses: 0,
      hitRatio: 0,
      totalOperations: 0,
      costSavings: 0,
    });

    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('Sin datos aún: todavía no hay operaciones en la caché de IA.')
      ).toBeInTheDocument()
    );
  });

  it('muestra "Sin datos aún" en la caché si el endpoint falla', async () => {
    (cacheAnalyticsService.getCacheRealtime as jest.Mock).mockRejectedValue(
      new Error('Error del servidor')
    );

    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('Sin datos aún: todavía no hay operaciones en la caché de IA.')
      ).toBeInTheDocument()
    );
  });
});
