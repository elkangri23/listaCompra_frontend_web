import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSystemAlerts, useSystemHealth } from '../hooks/use-system-status';
import type { SystemHealthLevel } from '../types';

const LEVEL_LABEL: Record<SystemHealthLevel, string> = {
  healthy: 'En orden',
  degraded: 'Degradado',
  unhealthy: 'Con problemas',
};

const LEVEL_STYLE: Record<SystemHealthLevel, string> = {
  healthy: 'bg-green-100 text-green-800',
  degraded: 'bg-yellow-100 text-yellow-800',
  unhealthy: 'bg-red-100 text-red-800',
};

function formatUptime(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
  return `${Math.floor(seconds / 86400)} días`;
}

/**
 * Estado del servicio: salud de la API y la caché, y alertas activas del
 * backend (tasa de errores, tiempo de respuesta, hit ratio de caché).
 * Si el endpoint no responde, la tarjeta se oculta: el estado del
 * servicio no debe estorbar al panel principal.
 */
export function SystemStatusSection() {
  const { data: health, isLoading: isLoadingHealth, isError: isErrorHealth } = useSystemHealth();
  const { data: alerts, isLoading: isLoadingAlerts } = useSystemAlerts();

  if (isErrorHealth) return null;
  if (isLoadingHealth || !health) return null;

  const activeAlerts = alerts?.activeAlerts ?? [];

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Estado del servicio</h2>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {health.overall === 'healthy' ? (
              <CheckCircle2 className="h-5 w-5 text-[#15803d]" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-[#a16207]" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {health.overall === 'healthy'
                  ? 'Todo en orden'
                  : 'El servicio tiene incidencias'}
              </p>
              <p className="text-xs text-[#4b5563]">
                API: {LEVEL_LABEL[health.services.api]} · Caché:{' '}
                {LEVEL_LABEL[health.services.cache]} · En marcha desde hace{' '}
                {formatUptime(health.uptime)}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_STYLE[health.overall]}`}
          >
            {LEVEL_LABEL[health.overall]}
          </span>
        </div>

        {isLoadingAlerts ? (
          <p className="text-sm text-[#4b5563] mt-3">Comprobando alertas...</p>
        ) : activeAlerts.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {activeAlerts.map((alert) => (
              <li key={alert.type} className="flex items-start gap-2 text-sm">
                <AlertTriangle
                  className={`h-4 w-4 mt-0.5 shrink-0 ${
                    alert.severity === 'high' ? 'text-red-600' : 'text-[#a16207]'
                  }`}
                />
                <span className="text-gray-700">{alert.message}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[#4b5563] mt-3">Sin alertas activas.</p>
        )}
      </div>
    </section>
  );
}
