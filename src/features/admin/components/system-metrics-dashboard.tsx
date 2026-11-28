import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  CacheAnalyticsDto,
  EndpointMetricsDto,
  PerformanceMetricsDto,
  SystemMetricsDto,
} from '@/types/dtos/admin';

interface MetricsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
}

const MetricCard = ({ title, value, subtitle }: MetricsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

/** Sin datos aún: la caché puede no tener operaciones registradas o no estar disponible. */
function isCacheAnalytics(
  value: SystemMetricsDto['cacheMetrics'],
): value is CacheAnalyticsDto {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as CacheAnalyticsDto).hitRatio === 'number'
  );
}

function EndpointRow({ endpoint, detail }: { endpoint: EndpointMetricsDto; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-mono truncate">
        {endpoint.method} {endpoint.path}
      </span>
      <span className="text-sm text-muted-foreground shrink-0">{detail}</span>
    </div>
  );
}

interface SystemMetricsDashboardProps {
  metrics: SystemMetricsDto;
  performance?: PerformanceMetricsDto;
}

export function SystemMetricsDashboard({ metrics, performance }: SystemMetricsDashboardProps) {
  const system = metrics.systemMetrics;
  const cache = metrics.cacheMetrics;
  const cacheAnalytics = isCacheAnalytics(cache) ? cache : null;
  const hasTraffic = system.globalRequestCount > 0;

  const topEndpoints = [...(metrics.endpointMetrics ?? [])]
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, 5);

  const slowest = [...(performance?.slowestEndpoints ?? [])].slice(0, 5);
  const errorProne = [...(performance?.errorProneEndpoints ?? [])].slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Peticiones totales"
          value={system.globalRequestCount}
          subtitle={`${system.totalEndpoints} endpoints registrados`}
        />
        <MetricCard
          title="Éxito"
          value={hasTraffic ? `${system.globalSuccessRate.toFixed(1)} %` : 'sin datos aún'}
          subtitle={
            hasTraffic ? 'Peticiones con respuesta correcta' : 'Aún no hay peticiones registradas'
          }
        />
        <MetricCard
          title="Tiempo medio de respuesta"
          value={hasTraffic ? `${Math.round(system.globalAvgResponseTime)} ms` : 'sin datos aún'}
          subtitle={
            hasTraffic ? 'Media de todas las peticiones' : 'Aún no hay peticiones registradas'
          }
        />
        <MetricCard
          title="Ratio de caché"
          value={
            cacheAnalytics
              ? `${(cacheAnalytics.hitRatio * 100).toFixed(1)} %`
              : 'sin datos aún'
          }
          subtitle={
            cacheAnalytics
              ? `${cacheAnalytics.hits} aciertos · ${cacheAnalytics.misses} fallos`
              : 'Aún no hay operaciones de caché registradas'
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Endpoints con más tráfico</CardTitle>
          </CardHeader>
          <CardContent>
            {topEndpoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">sin datos aún</p>
            ) : (
              <div className="space-y-2">
                {topEndpoints.map((endpoint) => (
                  <EndpointRow
                    key={`${endpoint.method}:${endpoint.path}`}
                    endpoint={endpoint}
                    detail={`${endpoint.totalRequests} peticiones · ${Math.round(endpoint.avgResponseTime)} ms de media`}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caché</CardTitle>
          </CardHeader>
          <CardContent>
            {cacheAnalytics ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Operaciones totales</span>
                  <span className="text-sm font-medium">{cacheAnalytics.totalOperations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lecturas por minuto</span>
                  <span className="text-sm font-medium">
                    {cacheAnalytics.readsPerMinute.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Escrituras por minuto</span>
                  <span className="text-sm font-medium">
                    {cacheAnalytics.writesPerMinute.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Peticiones API evitadas
                  </span>
                  <span className="text-sm font-medium">{cacheAnalytics.costSavings}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">sin datos aún</p>
            )}
          </CardContent>
        </Card>
      </div>

      {performance && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints más lentos</CardTitle>
            </CardHeader>
            <CardContent>
              {slowest.length === 0 ? (
                <p className="text-sm text-muted-foreground">sin datos aún</p>
              ) : (
                <div className="space-y-2">
                  {slowest.map((endpoint) => (
                    <EndpointRow
                      key={`${endpoint.method}:${endpoint.path}`}
                      endpoint={endpoint}
                      detail={`${Math.round(endpoint.avgResponseTime)} ms de media`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endpoints con más errores</CardTitle>
            </CardHeader>
            <CardContent>
              {errorProne.length === 0 ? (
                <p className="text-sm text-muted-foreground">sin datos aún</p>
              ) : (
                <div className="space-y-2">
                  {errorProne.map((endpoint) => (
                    <EndpointRow
                      key={`${endpoint.method}:${endpoint.path}`}
                      endpoint={endpoint}
                      detail={`${endpoint.errorRequests} errores`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
