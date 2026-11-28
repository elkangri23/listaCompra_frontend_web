import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatUptime } from '@/lib/format-uptime';
import type { DashboardAlertsDto, HealthLevel, HealthStatusDto } from '@/types/dtos/admin';

interface SystemHealthPanelProps {
  health: HealthStatusDto;
  /** Alertas de /dashboard/alerts; undefined mientras cargan. */
  alerts?: DashboardAlertsDto;
  alertsLoading?: boolean;
}

const LEVEL_LABEL: Record<HealthLevel, string> = {
  healthy: 'En orden',
  degraded: 'Degradado',
  unhealthy: 'Con problemas',
};

const OVERALL_BADGE_TEXT: Record<HealthLevel, string> = {
  healthy: '✓ Todo en orden',
  degraded: '⚠ Degradado',
  unhealthy: '✗ Con problemas',
};

const SEVERITY_LABEL: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

function ServiceRow({ label, level }: { label: string; level: HealthLevel }) {
  const dotColor =
    level === 'healthy'
      ? 'bg-green-500'
      : level === 'degraded'
        ? 'bg-yellow-500'
        : 'bg-red-500';
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-sm text-muted-foreground">{LEVEL_LABEL[level]}</span>
      </div>
    </div>
  );
}

export function SystemHealthPanel({ health, alerts, alertsLoading }: SystemHealthPanelProps) {
  const badgeVariant =
    health.overall === 'healthy'
      ? 'default'
      : health.overall === 'degraded'
        ? 'secondary'
        : 'destructive';

  const activeAlerts = alerts?.activeAlerts ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Estado del Sistema
            <Badge variant={badgeVariant}>{OVERALL_BADGE_TEXT[health.overall]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ServiceRow label="API" level={health.services.api} />
          <ServiceRow label="Caché" level={health.services.cache} />
          <ServiceRow label="Métricas" level={health.services.metrics} />

          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              En marcha desde hace {formatUptime(health.uptime)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Última actualización: {new Date(health.timestamp).toLocaleString('es-ES')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Alertas activas{alerts ? ` (${alerts.alertCount})` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading || !alerts ? (
            <p className="text-sm text-muted-foreground">Comprobando alertas…</p>
          ) : activeAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ninguna alerta activa.</p>
          ) : (
            <ul className="space-y-3">
              {activeAlerts.map((alert) => (
                <li key={alert.type} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={alert.severity === 'high' ? 'destructive' : 'secondary'}
                    >
                      {SEVERITY_LABEL[alert.severity] ?? alert.severity}
                    </Badge>
                    <span className="text-sm font-medium">{alert.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
