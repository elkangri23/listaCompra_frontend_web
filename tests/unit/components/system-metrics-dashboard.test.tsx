import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemMetricsDashboard } from '@/features/admin/components/system-metrics-dashboard';
import type { PerformanceMetricsDto, SystemMetricsDto } from '@/types/dtos/admin';

const endpoint = (
  overrides: Partial<{
    path: string;
    method: string;
    totalRequests: number;
    avgResponseTime: number;
    errorRequests: number;
  }> = {}
) => ({
  path: '/api/v1/lists',
  method: 'GET',
  totalRequests: 500,
  successRequests: 490,
  errorRequests: 10,
  totalResponseTime: 50000,
  minResponseTime: 20,
  maxResponseTime: 800,
  avgResponseTime: 100,
  lastUpdated: '2025-11-28T10:00:00.000Z',
  ...overrides,
});

const mockMetrics: SystemMetricsDto = {
  systemMetrics: {
    totalEndpoints: 12,
    globalRequestCount: 1250,
    globalSuccessRate: 98.4,
    globalAvgResponseTime: 125.5,
    uptime: 3600000,
    startTime: '2025-11-28T09:00:00.000Z',
  },
  endpointMetrics: [
    endpoint(),
    endpoint({ path: '/api/v1/auth/login', method: 'POST', totalRequests: 300, avgResponseTime: 80 }),
  ],
  cacheMetrics: {
    hits: 800,
    misses: 200,
    hitRatio: 0.8,
    averageResponseTime: 45,
    cacheResponseTime: 12,
    apiResponseTime: 180,
    totalOperations: 1000,
    readsPerMinute: 50,
    writesPerMinute: 10,
    costSavings: 800,
    spaceSavings: 12.5,
    categoryStats: {},
  },
};

const mockPerformance: PerformanceMetricsDto = {
  slowestEndpoints: [
    endpoint({ path: '/api/v1/ai/analyze', method: 'POST', totalRequests: 40, avgResponseTime: 1000 }),
  ],
  errorProneEndpoints: [
    endpoint({ path: '/api/v1/lists', method: 'GET', errorRequests: 10 }),
  ],
  errorRateStats: [{ path: '/api/v1/lists', method: 'GET', errorRate: 2, totalErrors: 10 }],
  timestamp: '2025-11-28T10:00:00.000Z',
};

describe('SystemMetricsDashboard', () => {
  describe('Contadores principales', () => {
    it('debe mostrar peticiones, éxito, tiempo medio y ratio de caché', () => {
      render(<SystemMetricsDashboard metrics={mockMetrics} />);

      expect(screen.getByText('Peticiones totales')).toBeInTheDocument();
      expect(screen.getByText('1250')).toBeInTheDocument();
      expect(screen.getByText('98.4 %')).toBeInTheDocument();
      expect(screen.getByText('126 ms')).toBeInTheDocument();
      expect(screen.getByText('80.0 %')).toBeInTheDocument();
      expect(screen.getByText('800 aciertos · 200 fallos')).toBeInTheDocument();
    });

    it('debe mostrar "sin datos aún" en éxito y tiempo medio cuando no hay tráfico', () => {
      const noTraffic: SystemMetricsDto = {
        ...mockMetrics,
        systemMetrics: { ...mockMetrics.systemMetrics, globalRequestCount: 0 },
        endpointMetrics: [],
        cacheMetrics: null,
      };

      render(<SystemMetricsDashboard metrics={noTraffic} />);

      expect(screen.getAllByText('sin datos aún').length).toBeGreaterThanOrEqual(3);
      expect(
        screen.getAllByText('Aún no hay peticiones registradas')
      ).toHaveLength(2);
    });
  });

  describe('Caché', () => {
    it('debe mostrar el detalle de la caché cuando hay datos', () => {
      render(<SystemMetricsDashboard metrics={mockMetrics} />);

      expect(screen.getByText('Operaciones totales')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
      expect(screen.getByText('Peticiones API evitadas')).toBeInTheDocument();
      expect(screen.getByText('800')).toBeInTheDocument();
    });

    it('debe mostrar "sin datos aún" cuando cacheMetrics es null', () => {
      const noCache: SystemMetricsDto = { ...mockMetrics, cacheMetrics: null };

      render(<SystemMetricsDashboard metrics={noCache} />);

      expect(screen.getByText('Caché')).toBeInTheDocument();
      // Ratio de caché + tarjeta de caché: dos «sin datos aún»
      expect(screen.getAllByText('sin datos aún')).toHaveLength(2);
      expect(
        screen.getByText('Aún no hay operaciones de caché registradas')
      ).toBeInTheDocument();
    });

    it('debe mostrar "sin datos aún" cuando la caché devuelve un error', () => {
      const errorCache: SystemMetricsDto = {
        ...mockMetrics,
        cacheMetrics: { error: 'Cache analytics unavailable' },
      };

      render(<SystemMetricsDashboard metrics={errorCache} />);

      expect(screen.getAllByText('sin datos aún').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Operaciones totales')).not.toBeInTheDocument();
    });
  });

  describe('Endpoints', () => {
    it('debe listar los endpoints con más tráfico', () => {
      render(<SystemMetricsDashboard metrics={mockMetrics} />);

      expect(screen.getByText('Endpoints con más tráfico')).toBeInTheDocument();
      expect(screen.getByText('GET /api/v1/lists')).toBeInTheDocument();
      expect(screen.getByText('POST /api/v1/auth/login')).toBeInTheDocument();
    });

    it('debe mostrar "sin datos aún" sin endpoints', () => {
      const noEndpoints: SystemMetricsDto = { ...mockMetrics, endpointMetrics: [] };

      render(<SystemMetricsDashboard metrics={noEndpoints} />);

      expect(screen.getByText('Endpoints con más tráfico')).toBeInTheDocument();
      expect(screen.getAllByText('sin datos aún').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Rendimiento', () => {
    it('NO debe renderizar la sección de rendimiento si performance es undefined', () => {
      render(<SystemMetricsDashboard metrics={mockMetrics} />);

      expect(screen.queryByText('Endpoints más lentos')).not.toBeInTheDocument();
      expect(screen.queryByText('Endpoints con más errores')).not.toBeInTheDocument();
    });

    it('debe renderizar los endpoints más lentos y con más errores', () => {
      render(<SystemMetricsDashboard metrics={mockMetrics} performance={mockPerformance} />);

      expect(screen.getByText('Endpoints más lentos')).toBeInTheDocument();
      expect(screen.getByText('POST /api/v1/ai/analyze')).toBeInTheDocument();
      expect(screen.getByText('1000 ms de media')).toBeInTheDocument();
      expect(screen.getByText('Endpoints con más errores')).toBeInTheDocument();
      expect(screen.getByText('10 errores')).toBeInTheDocument();
    });

    it('debe mostrar "sin datos aún" en las listas de rendimiento vacías', () => {
      const emptyPerformance: PerformanceMetricsDto = {
        slowestEndpoints: [],
        errorProneEndpoints: [],
        errorRateStats: [],
        timestamp: '2025-11-28T10:00:00.000Z',
      };

      render(<SystemMetricsDashboard metrics={mockMetrics} performance={emptyPerformance} />);

      expect(screen.getAllByText('sin datos aún').length).toBeGreaterThanOrEqual(2);
    });
  });
});
