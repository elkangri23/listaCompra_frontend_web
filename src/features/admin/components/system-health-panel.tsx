import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HealthStatusDto, PerformanceMetricsDto } from '@/types/dtos/admin';

interface SystemHealthPanelProps {
  health: HealthStatusDto;
  performance?: PerformanceMetricsDto;
}

export function SystemHealthPanel({ health, performance }: SystemHealthPanelProps) {
  const getStatusColor = (status: 'up' | 'down' | 'healthy' | 'degraded') => {
    switch (status) {
      case 'up':
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: 'healthy' | 'degraded' | 'down') => {
    const variants: Record<typeof status, 'default' | 'secondary' | 'destructive'> = {
      healthy: 'default',
      degraded: 'secondary',
      down: 'destructive',
    };
    return variants[status];
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Estado del Sistema
            <Badge variant={getStatusBadge(health.status)}>
              {health.status === 'healthy' && '✓ Saludable'}
              {health.status === 'degraded' && '⚠ Degradado'}
              {health.status === 'down' && '✗ Caído'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Base de Datos</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(health.database)}`} />
              <span className="text-sm text-muted-foreground">
                {health.database === 'up' ? 'Operativa' : 'Fuera de servicio'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Caché</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(health.cache)}`} />
              <span className="text-sm text-muted-foreground">
                {health.cache === 'up' ? 'Operativa' : 'Fuera de servicio'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Servicio IA</span>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColor(health.aiService)}`} />
              <span className="text-sm text-muted-foreground">
                {health.aiService === 'up' ? 'Operativa' : 'Fuera de servicio'}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">{health.message}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Última actualización: {new Date(health.timestamp).toLocaleString('es-ES')}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {performance && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Rendimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tiempo de respuesta API</span>
              <span className="text-sm text-muted-foreground">{performance.apiResponseTime}ms</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tiempo de consulta BD</span>
              <span className="text-sm text-muted-foreground">{performance.databaseQueryTime}ms</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tasa de aciertos caché</span>
              <span className="text-sm text-muted-foreground">{performance.cacheHitRate}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tasa de errores</span>
              <span className={`text-sm ${performance.errorRate > 5 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {performance.errorRate}%
              </span>
            </div>
            
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Requests/minuto</span>
                <span className="text-xs font-medium">{performance.requestsPerMinute}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Conexiones activas</span>
                <span className="text-xs font-medium">{performance.activeConnections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uso de memoria</span>
                <span className="text-xs font-medium">{performance.memoryUsage} MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Uso de CPU</span>
                <span className="text-xs font-medium">{performance.cpuUsage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
