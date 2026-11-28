import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemHealthPanel } from '@/features/admin/components/system-health-panel';
import type {
  DashboardAlertsDto,
  HealthStatusDto,
} from '@/types/dtos/admin';

describe('SystemHealthPanel', () => {
  const mockHealthHealthy: HealthStatusDto = {
    overall: 'healthy',
    services: { api: 'healthy', cache: 'healthy', metrics: 'healthy' },
    uptime: 3600000,
    timestamp: '2025-11-28T10:00:00Z',
  };

  const mockHealthDegraded: HealthStatusDto = {
    overall: 'degraded',
    services: { api: 'healthy', cache: 'degraded', metrics: 'healthy' },
    uptime: 5400000,
    timestamp: '2025-11-28T10:00:00Z',
  };

  const mockHealthUnhealthy: HealthStatusDto = {
    overall: 'unhealthy',
    services: { api: 'unhealthy', cache: 'healthy', metrics: 'healthy' },
    uptime: 30000,
    timestamp: '2025-11-28T10:00:00Z',
  };

  const mockAlerts: DashboardAlertsDto = {
    activeAlerts: [
      {
        type: 'error_rate',
        severity: 'medium',
        message: 'Error rate is high: 12.0%',
        value: 0.12,
        threshold: 0.1,
        timestamp: '2025-11-28T10:00:00Z',
      },
      {
        type: 'cache_hit_ratio',
        severity: 'high',
        message: 'Cache hit ratio is low: 40.0%',
        value: 0.4,
        threshold: 0.7,
        timestamp: '2025-11-28T10:00:00Z',
      },
    ],
    alertCount: 2,
    timestamp: '2025-11-28T10:00:00Z',
  };

  const emptyAlerts: DashboardAlertsDto = {
    activeAlerts: [],
    alertCount: 0,
    timestamp: '2025-11-28T10:00:00Z',
  };

  describe('Renderizado del estado del sistema', () => {
    it('debe renderizar el título "Estado del Sistema"', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={emptyAlerts} />);

      expect(screen.getByText('Estado del Sistema')).toBeInTheDocument();
    });

    it('debe mostrar "Todo en orden" con estado healthy', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={emptyAlerts} />);

      expect(screen.getByText('✓ Todo en orden')).toBeInTheDocument();
    });

    it('debe mostrar "Degradado" con estado degraded', () => {
      render(<SystemHealthPanel health={mockHealthDegraded} alerts={emptyAlerts} />);

      expect(screen.getByText('⚠ Degradado')).toBeInTheDocument();
    });

    it('debe mostrar "Con problemas" con estado unhealthy', () => {
      render(<SystemHealthPanel health={mockHealthUnhealthy} alerts={emptyAlerts} />);

      expect(screen.getByText('✗ Con problemas')).toBeInTheDocument();
    });

    it('debe renderizar el estado de cada servicio (API, Caché, Métricas)', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={emptyAlerts} />);

      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Caché')).toBeInTheDocument();
      expect(screen.getByText('Métricas')).toBeInTheDocument();
      expect(screen.getAllByText('En orden')).toHaveLength(3);
    });

    it('debe marcar la caché como Degradado cuando está degraded', () => {
      render(<SystemHealthPanel health={mockHealthDegraded} alerts={emptyAlerts} />);

      expect(screen.getByText('Degradado')).toBeInTheDocument();
    });

    it('debe mostrar el tiempo en marcha formateado', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={emptyAlerts} />);

      expect(screen.getByText(/En marcha desde hace 1 h/)).toBeInTheDocument();
    });

    it('debe mostrar "menos de 1 min" con uptime corto', () => {
      render(<SystemHealthPanel health={mockHealthUnhealthy} alerts={emptyAlerts} />);

      expect(screen.getByText(/En marcha desde hace menos de 1 min/)).toBeInTheDocument();
    });

    it('debe formatear y mostrar el timestamp en formato español', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={emptyAlerts} />);

      const timestampText = screen.getByText(/Última actualización:/);
      expect(timestampText).toBeInTheDocument();
      expect(timestampText).toHaveTextContent('Última actualización:');
    });
  });

  describe('Renderizado de alertas', () => {
    it('debe mostrar el contador de alertas en el título', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={mockAlerts} />);

      expect(screen.getByText('Alertas activas (2)')).toBeInTheDocument();
    });

    it('debe listar las alertas con su mensaje y severidad', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={mockAlerts} />);

      expect(screen.getByText('Error rate is high: 12.0%')).toBeInTheDocument();
      expect(screen.getByText('Cache hit ratio is low: 40.0%')).toBeInTheDocument();
      expect(screen.getByText('Media')).toBeInTheDocument();
      expect(screen.getByText('Alta')).toBeInTheDocument();
    });

    it('debe mostrar "Ninguna alerta activa." cuando no hay alertas', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alerts={emptyAlerts} />);

      expect(screen.getByText('Alertas activas (0)')).toBeInTheDocument();
      expect(screen.getByText('Ninguna alerta activa.')).toBeInTheDocument();
    });

    it('debe mostrar "Comprobando alertas…" mientras cargan', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} alertsLoading />);

      expect(screen.getByText('Comprobando alertas…')).toBeInTheDocument();
    });

    it('debe mostrar "Comprobando alertas…" si aún no hay datos de alertas', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      expect(screen.getByText('Comprobando alertas…')).toBeInTheDocument();
    });
  });
});
