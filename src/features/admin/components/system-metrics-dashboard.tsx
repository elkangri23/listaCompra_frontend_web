import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SystemMetricsDto } from '@/types/dtos/admin';

interface MetricsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard = ({ title, value, subtitle, icon, trend }: MetricsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend === 'up' && <span className="text-green-600">↑</span>}
            {trend === 'down' && <span className="text-red-600">↓</span>}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface SystemMetricsDashboardProps {
  metrics: SystemMetricsDto;
}

export function SystemMetricsDashboard({ metrics }: SystemMetricsDashboardProps) {
  const categorizedPercentage = metrics.totalProducts > 0
    ? Math.round((metrics.categorizedProducts / metrics.totalProducts) * 100)
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Usuarios Totales"
        value={metrics.totalUsers}
        subtitle={`${metrics.activeUsers} activos`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      />
      
      <MetricCard
        title="Listas de Compra"
        value={metrics.totalLists}
        subtitle={`${metrics.activeLists} activas`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
        }
      />
      
      <MetricCard
        title="Productos"
        value={metrics.totalProducts}
        subtitle={`${categorizedPercentage}% categorizados`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        }
      />
      
      <MetricCard
        title="Invitaciones"
        value={metrics.totalInvitations}
        subtitle={`${metrics.pendingInvitations} pendientes`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />
      
      <MetricCard
        title="Plantillas (Blueprints)"
        value={metrics.totalBlueprints}
        subtitle={`${metrics.publicBlueprints} públicas`}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" x2="15" y1="15" y2="15" />
          </svg>
        }
      />
      
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Resumen del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tasa de actividad de usuarios</span>
              <span className="text-sm font-medium">
                {metrics.totalUsers > 0
                  ? Math.round((metrics.activeUsers / metrics.totalUsers) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Listas con colaboración</span>
              <span className="text-sm font-medium">
                {Math.round((metrics.totalInvitations / Math.max(metrics.totalLists, 1)) * 100)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Productos categorizados</span>
              <span className="text-sm font-medium">{categorizedPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Plantillas compartidas</span>
              <span className="text-sm font-medium">
                {metrics.totalBlueprints > 0
                  ? Math.round((metrics.publicBlueprints / metrics.totalBlueprints) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
