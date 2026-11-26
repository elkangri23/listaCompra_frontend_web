import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CacheAnalyticsSection } from '@/features/settings/components/cache-analytics-section';
import { cacheAnalyticsService } from '@/features/settings/services/cache-analytics-service';

jest.mock('@/features/settings/services/cache-analytics-service', () => ({
  cacheAnalyticsService: {
    getCacheRealtime: jest.fn(),
  },
}));

const mockGetRealtime = cacheAnalyticsService.getCacheRealtime as jest.Mock;

const analytics = {
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
  categoryStats: {
    'ai-category': { hits: 50, misses: 10, hitRatio: 0.83, avgTTL: 300 },
    other: { hits: 0, misses: 0, hitRatio: 0, avgTTL: 0 },
  },
  timestamp: '2026-11-26T17:00:00.000Z',
  window: '5 minutes',
};

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CacheAnalyticsSection />
    </QueryClientProvider>,
  );
}

describe('CacheAnalyticsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRealtime.mockResolvedValue(analytics);
  });

  it('muestra el acierto de caché, el ahorro y el desglose por categoría', async () => {
    renderSection();

    expect(await screen.findByText('80%')).toBeInTheDocument();
    expect(screen.getByText('80 aciertos · 20 fallos')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Categorías de IA')).toBeInTheDocument();
    expect(screen.getByText(/83% aciertos/)).toBeInTheDocument();
    // La categoría sin operaciones no se muestra
    expect(screen.queryByText('Otras')).not.toBeInTheDocument();
  });

  it('muestra el error cuando la carga falla', async () => {
    mockGetRealtime.mockRejectedValue(new Error('caído'));
    renderSection();

    expect(
      await screen.findByText('No se pudo cargar la analítica de caché ahora mismo.'),
    ).toBeInTheDocument();
  });
});
