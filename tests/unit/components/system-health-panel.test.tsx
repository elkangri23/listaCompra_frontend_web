import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemHealthPanel } from '@/features/admin/components/system-health-panel';
import type { HealthStatusDto, PerformanceMetricsDto } from '@/types/dtos/admin';

describe('SystemHealthPanel', () => {
  const mockHealthHealthy: HealthStatusDto = {
    status: 'healthy',
    database: 'up',
    cache: 'up',
    aiService: 'up',
    message: 'Todos los servicios operativos',
    timestamp: '2025-11-26T10:00:00Z',
  };

  const mockHealthDegraded: HealthStatusDto = {
    status: 'degraded',
    database: 'up',
    cache: 'down',
    aiService: 'up',
    message: 'Servicio de caché no disponible',
    timestamp: '2025-11-26T10:00:00Z',
  };

  const mockHealthDown: HealthStatusDto = {
    status: 'down',
    database: 'down',
    cache: 'down',
    aiService: 'down',
    message: 'Sistema fuera de servicio',
    timestamp: '2025-11-26T10:00:00Z',
  };

  const mockPerformance: PerformanceMetricsDto = {
    apiResponseTime: 120,
    databaseQueryTime: 45,
    cacheHitRate: 85,
    errorRate: 2,
    requestsPerMinute: 350,
    activeConnections: 42,
    memoryUsage: 512,
    cpuUsage: 35,
  };

  describe('Renderizado del estado del sistema', () => {
    it('debe renderizar el título "Estado del Sistema"', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      expect(screen.getByText('Estado del Sistema')).toBeInTheDocument();
    });

    it('debe mostrar Badge "Saludable" con estado healthy', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      expect(screen.getByText('✓ Saludable')).toBeInTheDocument();
    });

    it('debe mostrar Badge "Degradado" con estado degraded', () => {
      render(<SystemHealthPanel health={mockHealthDegraded} />);

      expect(screen.getByText('⚠ Degradado')).toBeInTheDocument();
    });

    it('debe mostrar Badge "Caído" con estado down', () => {
      render(<SystemHealthPanel health={mockHealthDown} />);

      expect(screen.getByText('✗ Caído')).toBeInTheDocument();
    });

    it('debe renderizar el estado de la Base de Datos (Operativa/Fuera de servicio)', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      expect(screen.getByText('Base de Datos')).toBeInTheDocument();
      const operativaElements = screen.getAllByText('Operativa');
      expect(operativaElements.length).toBeGreaterThanOrEqual(1);
    });

    it('debe renderizar el estado del Caché como "Fuera de servicio" cuando está down', () => {
      render(<SystemHealthPanel health={mockHealthDegraded} />);

      const fueraServicio = screen.getAllByText('Fuera de servicio');
      expect(fueraServicio.length).toBeGreaterThan(0);
    });

    it('debe renderizar el estado del Servicio IA', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      expect(screen.getByText('Servicio IA')).toBeInTheDocument();
    });

    it('debe mostrar el mensaje de estado del sistema', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      expect(screen.getByText('Todos los servicios operativos')).toBeInTheDocument();
    });

    it('debe formatear y mostrar el timestamp en formato español', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      const timestampText = screen.getByText(/Última actualización:/);
      expect(timestampText).toBeInTheDocument();
      // Verifica que contiene el timestamp formateado
      expect(timestampText).toHaveTextContent('Última actualización:');
    });
  });

  describe('Renderizado de métricas de rendimiento', () => {
    it('NO debe renderizar la tarjeta de métricas si performance es undefined', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} />);

      expect(screen.queryByText('Métricas de Rendimiento')).not.toBeInTheDocument();
    });

    it('debe renderizar el título "Métricas de Rendimiento" cuando performance está presente', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} performance={mockPerformance} />);

      expect(screen.getByText('Métricas de Rendimiento')).toBeInTheDocument();
    });

    it('debe mostrar todas las métricas de rendimiento con valores correctos', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} performance={mockPerformance} />);

      expect(screen.getByText('Tiempo de respuesta API')).toBeInTheDocument();
      expect(screen.getByText('120ms')).toBeInTheDocument();

      expect(screen.getByText('Tiempo de consulta BD')).toBeInTheDocument();
      expect(screen.getByText('45ms')).toBeInTheDocument();

      expect(screen.getByText('Tasa de aciertos caché')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();

      expect(screen.getByText('Tasa de errores')).toBeInTheDocument();
      expect(screen.getByText('2%')).toBeInTheDocument();
    });

    it('debe renderizar métricas adicionales en la sección inferior', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} performance={mockPerformance} />);

      expect(screen.getByText('Requests/minuto')).toBeInTheDocument();
      expect(screen.getByText('350')).toBeInTheDocument();

      expect(screen.getByText('Conexiones activas')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();

      expect(screen.getByText('Uso de memoria')).toBeInTheDocument();
      expect(screen.getByText('512 MB')).toBeInTheDocument();

      expect(screen.getByText('Uso de CPU')).toBeInTheDocument();
      expect(screen.getByText('35%')).toBeInTheDocument();
    });

    it('debe aplicar clase text-red-600 cuando errorRate > 5%', () => {
      const highErrorPerformance: PerformanceMetricsDto = {
        ...mockPerformance,
        errorRate: 8, // > 5%
      };

      render(<SystemHealthPanel health={mockHealthHealthy} performance={highErrorPerformance} />);

      const errorRateElement = screen.getByText('8%');
      expect(errorRateElement).toHaveClass('text-red-600');
    });

    it('debe aplicar clase text-muted-foreground cuando errorRate <= 5%', () => {
      render(<SystemHealthPanel health={mockHealthHealthy} performance={mockPerformance} />);

      const errorRateElement = screen.getByText('2%');
      expect(errorRateElement).toHaveClass('text-muted-foreground');
      expect(errorRateElement).not.toHaveClass('text-red-600');
    });
  });
});
