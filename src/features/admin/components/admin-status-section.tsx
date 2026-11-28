'use client';

import { SkeletonCard } from '@/components/ui/skeleton';
import {
  useDashboardAlerts,
  useHealthStatus,
  usePerformanceMetrics,
  useSystemMetrics,
} from '@/features/admin/hooks/use-admin-users';
import { SystemHealthPanel } from './system-health-panel';
import { SystemMetricsDashboard } from './system-metrics-dashboard';

/**
 * Contenido real de la pestaña Estado del panel de administración
 * (fase 2): salud del sistema, alertas activas y métricas del backend
 * (GET /dashboard/health, /alerts, /metrics y /performance).
 * Cada bloque carga por su cuenta: si uno falla, los demás se siguen viendo.
 */
export function AdminStatusSection() {
  const { data: health, isLoading: healthLoading, isError: healthError } = useHealthStatus();
  const {
    data: alerts,
    isLoading: alertsLoading,
  } = useDashboardAlerts();
  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useSystemMetrics();
  const { data: performance } = usePerformanceMetrics();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Estado</h2>

      {healthLoading ? (
        <div
          className="grid gap-4 md:grid-cols-2"
          role="status"
          aria-label="Cargando estado del sistema…"
        >
          <span className="sr-only">Cargando estado del sistema…</span>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : healthError || !health ? (
        <p className="text-sm text-muted-foreground">
          No se pudo cargar el estado del sistema.
        </p>
      ) : (
        <SystemHealthPanel health={health} alerts={alerts} alertsLoading={alertsLoading} />
      )}

      {metricsLoading ? (
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          role="status"
          aria-label="Cargando métricas…"
        >
          <span className="sr-only">Cargando métricas…</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : metricsError || !metrics ? (
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar las métricas del sistema.
        </p>
      ) : (
        <SystemMetricsDashboard metrics={metrics} performance={performance} />
      )}
    </div>
  );
}
