'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/ui/skeleton';
import { AI_PROVIDERS } from '@/features/settings/services/ai-settings-service';
import { useAIConfig, useTestAIConfig } from '@/features/settings/hooks/use-ai-settings';
import { useCacheAnalytics } from '@/features/settings/hooks/use-cache-analytics';
import { useAIHealth, useAIUsage } from '@/features/admin/hooks/use-admin-users';
import type { AIOperation, AIUsageDto } from '@/types/dtos/admin';

const OPERATION_LABELS: Record<AIOperation, string> = {
  'category-suggestions': 'Sugerencias de categoría',
  'bulk-categorize': 'Categorización en lote',
  'config-test': 'Pruebas de conexión',
};

const HEALTH_LABEL: Record<'healthy' | 'degraded', string> = {
  healthy: 'En orden',
  degraded: 'Degradado',
};

const SHORT_MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** '2026-11-28' → '28 nov'. */
function formatDayLabel(date: string): string {
  const [, month, day] = date.split('-').map(Number);
  return `${day} ${SHORT_MONTHS[month - 1]}`;
}

/**
 * Contenido real de la pestaña IA del panel de administración (fase 3):
 * proveedor activo, uso real de IA y caché de IA.
 * Cada tarjeta carga por su cuenta: si una falla, las demás se siguen viendo.
 * La configuración NO se edita aquí: eso se queda en Ajustes → IA.
 */
export function AdminAISection() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">IA</h2>
      <ProviderCard />
      <UsageCard />
      <CacheCard />
    </div>
  );
}

function ProviderCard() {
  const queryClient = useQueryClient();
  const { data: config, isLoading: configLoading, isError: configError } = useAIConfig();
  const { data: health, isLoading: healthLoading, isError: healthError } = useAIHealth();
  const testConnection = useTestAIConfig();
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  if (configLoading || healthLoading) {
    return (
      <div role="status" aria-label="Cargando proveedor de IA…">
        <span className="sr-only">Cargando proveedor de IA…</span>
        <SkeletonCard />
      </div>
    );
  }

  if (configError || !config) {
    return (
      <p className="text-sm text-muted-foreground">
        No se pudo cargar la configuración de IA.
      </p>
    );
  }

  const provider = AI_PROVIDERS.find((p) => p.id === config.provider);
  const providerName = provider?.nombre ?? config.provider;
  const fallbackModel = provider?.modelosSugeridos[1];

  const handleTest = () => {
    setTestError(null);
    setTestLatency(null);
    testConnection.mutate(undefined, {
      onSuccess: (result) => {
        setTestLatency(result.latencyMs);
        void queryClient.invalidateQueries({ queryKey: ['admin', 'ai', 'health'] });
      },
      onError: (error: Error) => {
        setTestError(error.message);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proveedor activo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Proveedor</span>
          <span className="text-sm font-semibold">{providerName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Modelo</span>
          <span className="text-sm text-muted-foreground">{config.model}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Reserva</span>
          <span className="text-sm text-muted-foreground">{fallbackModel ?? 'Sin reserva'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">URL del API</span>
          <span className="text-sm text-muted-foreground break-all">{config.apiUrl}</span>
        </div>
        {healthError ? (
          <p className="text-sm text-muted-foreground">
            No se pudo comprobar la salud de la IA ahora mismo.
          </p>
        ) : (
          health && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salud</span>
                <Badge variant={health.status === 'healthy' ? 'default' : 'secondary'}>
                  {HEALTH_LABEL[health.status]}
                </Badge>
              </div>
              {health.reason && (
                <p className="text-sm text-muted-foreground">{health.reason}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Comprobación en caché</span>
                <span className="text-sm text-muted-foreground">
                  {health.cached ? 'Sí' : 'No'}
                </span>
              </div>
            </>
          )
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Última prueba</span>
          <span className="text-sm text-muted-foreground">
            {testLatency !== null
              ? `${testLatency} ms · correcta`
              : health?.latencyMs != null
                ? `${health.latencyMs} ms · ${new Date(health.checkedAt).toLocaleString('es-ES')}`
                : 'Sin datos aún'}
          </span>
        </div>
        {testError && (
          <p className="text-sm text-destructive" role="alert">
            La prueba falló: {testError}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={handleTest} disabled={testConnection.isPending}>
            {testConnection.isPending ? 'Probando…' : 'Probar conexión'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/settings">Cambiar en Ajustes → IA</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UsageCard() {
  const { data, isLoading, isError } = useAIUsage();

  if (isLoading) {
    return (
      <div role="status" aria-label="Cargando uso de IA…">
        <span className="sr-only">Cargando uso de IA…</span>
        <SkeletonCard />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        No se pudo cargar el uso de IA.
      </p>
    );
  }

  if (!data.hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sin datos aún: todavía no hay peticiones de IA registradas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageToday usage={data} />
        <Last7Days usage={data} />
      </CardContent>
    </Card>
  );
}

function UsageToday({ usage }: { usage: AIUsageDto }) {
  const { today } = usage;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Hoy</p>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Peticiones</p>
          <p className="text-lg font-semibold">{today.total}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Correctas</p>
          <p className="text-lg font-semibold">{today.success}</p>
          <p className="text-xs text-muted-foreground">{today.failed} fallidas</p>
        </div>
        <div>
          <p className="text-muted-foreground">Latencia media</p>
          <p className="text-lg font-semibold">
            {today.avgLatencyMs != null ? `${Math.round(today.avgLatencyMs)} ms` : '—'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Desde caché</p>
          <p className="text-lg font-semibold">
            {today.cachedPercentage != null ? `${Math.round(today.cachedPercentage)} %` : '—'}
          </p>
          <p className="text-xs text-muted-foreground">{today.cached} servidas desde caché</p>
        </div>
      </div>
      <ul className="space-y-1 text-sm">
        {(Object.keys(today.byOperation) as AIOperation[]).map((op) => (
          <li key={op} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{OPERATION_LABELS[op]}</span>
            <span>{today.byOperation[op]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Last7Days({ usage }: { usage: AIUsageDto }) {
  const maxTotal = Math.max(...usage.last7Days.map((d) => d.total), 1);
  return (
    <div>
      <p className="text-sm font-medium mb-2">Últimos 7 días</p>
      <div className="flex gap-2 items-end h-28" role="list" aria-label="Peticiones de IA por día">
        {usage.last7Days.map((day) => {
          const heightPct = Math.round((day.total / maxTotal) * 100);
          return (
            <div
              key={day.date}
              role="listitem"
              className="flex flex-1 flex-col items-center gap-1 h-full justify-end"
            >
              <span className="text-xs text-muted-foreground">{day.total}</span>
              <div
                className="w-full max-w-9 rounded-t-md bg-primary"
                style={{ height: `${heightPct}%` }}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">{formatDayLabel(day.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CacheCard() {
  const { data, isLoading, isError } = useCacheAnalytics();

  if (isLoading) {
    return (
      <div role="status" aria-label="Cargando caché de IA…">
        <span className="sr-only">Cargando caché de IA…</span>
        <SkeletonCard />
      </div>
    );
  }

  if (isError || !data || data.totalOperations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Caché de IA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sin datos aún: todavía no hay operaciones en la caché de IA.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hitRatioPct = Math.round(data.hitRatio * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Caché de IA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Aciertos de caché</p>
            <p className="text-lg font-semibold">{hitRatioPct} %</p>
            <p className="text-xs text-muted-foreground">
              {data.hits} aciertos · {data.misses} fallos
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Operaciones</p>
            <p className="text-lg font-semibold">{data.totalOperations}</p>
            <p className="text-xs text-muted-foreground">
              {data.readsPerMinute.toFixed(1)} lecturas/min
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Llamadas a la API evitadas</p>
            <p className="text-lg font-semibold">{data.costSavings}</p>
            <p className="text-xs text-muted-foreground">Cada acierto evita una llamada</p>
          </div>
          <div>
            <p className="text-muted-foreground">Respuesta media</p>
            <p className="text-lg font-semibold">{Math.round(data.cacheResponseTime)} ms</p>
            <p className="text-xs text-muted-foreground">
              Sin caché: {Math.round(data.apiResponseTime)} ms
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
