/**
 * Tests - AdminMetricsSection: pestaña Métricas del panel (/admin, fase 7).
 * Crecimiento (gráfico día/mes), embudo con tramos a null, tarjetas de
 * actividad, vigilancia de la última copia, uso de IA 7 días y bloques
 * «Próximamente» honestos. Skeletons y estados vacíos honestos.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  AdminMetricsSection,
  formatMetricsDayLabel,
  formatMetricsMonthLabel,
  formatBackupAge,
} from '@/features/admin/components/admin-metrics-section';
import { adminService } from '@/features/admin/services/admin-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';
import type { MetricsOverviewDto } from '@/types/dtos/admin';

jest.mock('@/features/admin/services/admin-service');

const mockGetAdminMetrics = adminService.getAdminMetrics as jest.Mock;

/** Serie de 30 días: conteos 0,1,2,0,1,2… (10 registros en total). */
function registrationsByDay() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2026-10-${String(i + 1).padStart(2, '0')}`,
    count: i % 3,
  }));
}

function zeroDaySeries() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2026-10-${String(i + 1).padStart(2, '0')}`,
    count: 0,
  }));
}

const metricsOverview: MetricsOverviewDto = {
  growth: {
    registrationsByDay: registrationsByDay(),
    registrationsByMonth: [
      { month: '2025-12', count: 0 },
      { month: '2026-01', count: 0 },
      { month: '2026-02', count: 0 },
      { month: '2026-03', count: 0 },
      { month: '2026-04', count: 0 },
      { month: '2026-05', count: 0 },
      { month: '2026-06', count: 0 },
      { month: '2026-07', count: 0 },
      { month: '2026-08', count: 0 },
      { month: '2026-09', count: 0 },
      { month: '2026-10', count: 10 },
      { month: '2026-11', count: 0 },
    ],
    listsByDay: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      count: i % 2,
    })),
    productsByDay: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      count: i % 4,
    })),
    totals: {
      users: 10,
      verifiedUsers: 8,
      verifiedPct: 80,
      lists: 15,
      products: 45,
      categorizedProducts: 30,
      categorizedPct: 66.7,
    },
  },
  funnel: {
    registered: 10,
    verified: 8,
    withList: 5,
    withProduct: 4,
    shared: 2,
  },
  activity: {
    activeUsersByDay: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      count: i % 2,
    })),
    retention: {
      available: false,
      reason: 'Hace falta registrar la última conexión de cada usuario.',
    },
  },
  backupHealth: {
    lastCreated: {
      id: 'bk-1',
      filename: 'backup-2026-11-28-040000.sql.gz',
      sizeBytes: 4404019,
      createdAt: '2026-11-28T04:00:00.000Z',
      ageHours: 9,
    },
    stale: false,
    reason: null,
  },
  aiUsage7d: {
    total: 20,
    success: 18,
    failed: 2,
    cached: 5,
    byDay: [
      { date: '2026-11-22', total: 3, success: 3 },
      { date: '2026-11-23', total: 2, success: 2 },
      { date: '2026-11-24', total: 4, success: 4 },
      { date: '2026-11-25', total: 0, success: 0 },
      { date: '2026-11-26', total: 5, success: 4 },
      { date: '2026-11-27', total: 3, success: 3 },
      { date: '2026-11-28', total: 3, success: 2 },
    ],
  },
};

const emptyOverview: MetricsOverviewDto = {
  growth: {
    registrationsByDay: zeroDaySeries(),
    registrationsByMonth: Array.from({ length: 12 }, (_, i) => ({
      month: `2025-${String(i + 1).padStart(2, '0')}`,
      count: 0,
    })),
    listsByDay: zeroDaySeries(),
    productsByDay: zeroDaySeries(),
    totals: {
      users: 0,
      verifiedUsers: 0,
      verifiedPct: 0,
      lists: 0,
      products: 0,
      categorizedProducts: 0,
      categorizedPct: 0,
    },
  },
  funnel: {
    registered: 0,
    verified: 0,
    withList: 0,
    withProduct: 0,
    shared: 0,
  },
  activity: {
    activeUsersByDay: [],
    retention: {
      available: false,
      reason: 'Hace falta registrar la última conexión de cada usuario.',
    },
  },
  backupHealth: { lastCreated: null, stale: false, reason: null },
  aiUsage7d: { total: 0, success: 0, failed: 0, cached: 0, byDay: [] },
};

const renderSection = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminMetricsSection />, { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('formatMetricsDayLabel / formatMetricsMonthLabel / formatBackupAge', () => {
  it('formatea fechas y meses en español', () => {
    expect(formatMetricsDayLabel('2026-11-28')).toBe('28 nov');
    expect(formatMetricsMonthLabel('2026-11')).toBe('nov 2026');
  });

  it('formatea la edad de la copia en horas o días', () => {
    expect(formatBackupAge(0.4)).toBe('hace menos de una hora');
    expect(formatBackupAge(9)).toBe('hace 9 horas');
    expect(formatBackupAge(50)).toBe('hace 2 días');
  });
});

describe('AdminMetricsSection', () => {
  it('muestra las tarjetas de crecimiento con los totales reales', async () => {
    mockGetAdminMetrics.mockResolvedValue(metricsOverview);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Registros por día (últimos 30 días)')).toBeInTheDocument()
    );
    expect(screen.getByText('Registros (30 días)')).toBeInTheDocument();
    expect(screen.getByText('10 usuarios en total')).toBeInTheDocument();
    expect(screen.getByText('Correo verificado')).toBeInTheDocument();
    expect(screen.getByText('8 de 10')).toBeInTheDocument();
    expect(screen.getByText('Listas (30 días)')).toBeInTheDocument();
    expect(screen.getByText('15 listas en total')).toBeInTheDocument();
    expect(screen.getByText('Productos con categoría')).toBeInTheDocument();
    expect(screen.getByText('30 de 45')).toBeInTheDocument();
    expect(screen.getByText('Usuarios activos hoy')).toBeInTheDocument();
    expect(screen.getByText('Usuarios activos (30 días)')).toBeInTheDocument();
  });

  it('el selector cambia el gráfico de día a mes', async () => {
    mockGetAdminMetrics.mockResolvedValue(metricsOverview);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Registros por día (últimos 30 días)')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Por mes' }));

    await waitFor(() =>
      expect(
        screen.getByText('Registros por mes (últimos 12 meses)')
      ).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Por mes' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('muestra el embudo con los 5 tramos y el % de paso entre tramos', async () => {
    mockGetAdminMetrics.mockResolvedValue(metricsOverview);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Embudo de activación')).toBeInTheDocument()
    );
    expect(screen.getByText('Se registran')).toBeInTheDocument();
    expect(screen.getByText('Verifican el correo')).toBeInTheDocument();
    expect(screen.getByText('Crean su primera lista')).toBeInTheDocument();
    expect(screen.getByText('Añaden su primer producto')).toBeInTheDocument();
    expect(screen.getByText('Comparten una lista')).toBeInTheDocument();
    expect(screen.getByText(/10 · 100 %/)).toBeInTheDocument();
    expect(screen.getByText(/8 · 80 % del tramo anterior/)).toBeInTheDocument();
    expect(screen.getByText(/5 · 63 % del tramo anterior/)).toBeInTheDocument();
    expect(screen.getByText(/4 · 80 % del tramo anterior/)).toBeInTheDocument();
    expect(screen.getByText(/2 · 50 % del tramo anterior/)).toBeInTheDocument();
  });

  it('un tramo del embudo a null se muestra como «sin datos», nunca inventado', async () => {
    mockGetAdminMetrics.mockResolvedValue({
      ...metricsOverview,
      funnel: {
        registered: 10,
        verified: 8,
        withList: null,
        withProduct: 4,
        shared: null,
      },
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Embudo de activación')).toBeInTheDocument()
    );
    expect(screen.getAllByText('sin datos')).toHaveLength(2);
    expect(screen.getByText(/8 · 80 % del tramo anterior/)).toBeInTheDocument();
    // Sin tramo anterior calculable, el siguiente no muestra % de paso.
    expect(screen.getByText(/4 · —/)).toBeInTheDocument();
  });

  it('muestra la última copia con fecha, tamaño y edad, y que está al día', async () => {
    mockGetAdminMetrics.mockResolvedValue(metricsOverview);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Última copia')).toBeInTheDocument()
    );
    expect(screen.getByText('backup-2026-11-28-040000.sql.gz')).toBeInTheDocument();
    expect(screen.getByText('4,2 MB')).toBeInTheDocument();
    expect(screen.getByText(/hace 9 horas/)).toBeInTheDocument();
    expect(
      screen.getByText('Copia al día: la última tiene menos de 24 horas.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con la copia antigua muestra una alerta visible con el motivo del backend', async () => {
    mockGetAdminMetrics.mockResolvedValue({
      ...metricsOverview,
      backupHealth: {
        lastCreated: {
          id: 'bk-1',
          filename: 'backup-2026-11-27-040000.sql.gz',
          sizeBytes: 4194304,
          createdAt: '2026-11-27T04:00:00.000Z',
          ageHours: 30,
        },
        stale: true,
        reason: 'La última copia tiene más de 24 horas.',
      },
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument()
    );
    expect(screen.getByText(/La última copia es antigua/)).toBeInTheDocument();
    expect(
      screen.getByText(/La última copia tiene más de 24 horas/)
    ).toBeInTheDocument();
    expect(screen.getByText(/hace 30 horas/)).toBeInTheDocument();
  });

  it('sin copias muestra «Sin copias aún» sin alerta', async () => {
    mockGetAdminMetrics.mockResolvedValue({
      ...metricsOverview,
      backupHealth: { lastCreated: null, stale: false, reason: null },
    });
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Sin copias aún')).toBeInTheDocument()
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el mini-resumen de uso de IA de los últimos 7 días', async () => {
    mockGetAdminMetrics.mockResolvedValue(metricsOverview);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Uso de IA (últimos 7 días)')).toBeInTheDocument()
    );
    expect(screen.getByText('2 fallidas')).toBeInTheDocument();
    expect(screen.getByText('5 servidas desde caché')).toBeInTheDocument();
    expect(screen.getByText('25 %')).toBeInTheDocument();
    expect(screen.getByText('2,9')).toBeInTheDocument();
  });

  it('sin datos muestra estados vacíos honestos en cada bloque', async () => {
    mockGetAdminMetrics.mockResolvedValue(emptyOverview);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Métricas de uso')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        screen.getByText('Sin datos aún: todavía no hay registros en este periodo.')
      ).toBeInTheDocument()
    );
    expect(screen.getByText('Sin datos aún')).toBeInTheDocument();
    expect(screen.getByText('Sin copias aún')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sin datos aún: todavía no hay peticiones de IA registradas en los últimos 7 días.'
      )
    ).toBeInTheDocument();
    // Embudo a cero: los tramos existen pero valen 0, no «sin datos».
    expect(screen.queryByText('sin datos')).not.toBeInTheDocument();
    expect(screen.getByText(/0 · 100 %/)).toBeInTheDocument();
  });

  it('los bloques Próximamente explican por qué, con el motivo real de retención', async () => {
    mockGetAdminMetrics.mockResolvedValue(metricsOverview);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('Adquisición')).toBeInTheDocument()
    );
    expect(screen.getAllByText('Próximamente')).toHaveLength(3);
    expect(
      screen.getByText(/Hoy no se guarda de dónde viene cada registro/)
    ).toBeInTheDocument();
    expect(
      screen.getByText('Hace falta registrar la última conexión de cada usuario.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El backend no guarda cuántas veces se usa cada plantilla/)
    ).toBeInTheDocument();
  });

  it('muestra skeletons mientras carga', async () => {
    mockGetAdminMetrics.mockImplementation(() => new Promise(() => {}));
    renderSection();

    expect(screen.getByLabelText('Cargando métricas de uso…')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargando gráfico de registros…')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargando embudo de activación…')).toBeInTheDocument();
  });

  it('muestra el error si no se pueden cargar las métricas', async () => {
    mockGetAdminMetrics.mockRejectedValue(new Error('No autorizado'));
    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('Error al cargar las métricas de uso.')
      ).toBeInTheDocument()
    );
  });
});
