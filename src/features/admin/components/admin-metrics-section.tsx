'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useAdminMetrics } from '@/features/admin/hooks/use-admin-users';
import { formatBackupSize } from '@/features/admin/components/admin-backups-section';
import type {
  MetricsDayCountDto,
  MetricsFunnelDto,
  MetricsOverviewDto,
} from '@/types/dtos/admin';

const SHORT_MONTHS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/** '2026-11-28' → '28 nov'. */
export function formatMetricsDayLabel(date: string): string {
  const [, month, day] = date.split('-').map(Number);
  return `${day} ${SHORT_MONTHS[month - 1]}`;
}

/** '2026-11' → 'nov 2026'. */
export function formatMetricsMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return `${SHORT_MONTHS[monthNumber - 1]} ${year}`;
}

/** 0,4 h → 'hace menos de una hora'; 26 h → 'hace 26 horas'; 50 h → 'hace 2 días'. */
export function formatBackupAge(ageHours: number): string {
  if (ageHours < 1) return 'hace menos de una hora';
  if (ageHours < 48) return `hace ${Math.round(ageHours)} horas`;
  return `hace ${Math.floor(ageHours / 24)} días`;
}

function sumCounts(series: MetricsDayCountDto[]): number {
  return series.reduce((total, day) => total + day.count, 0);
}

type ChartRange = 'day' | 'month';

const FUNNEL_STEPS: {
  key: keyof MetricsFunnelDto;
  label: string;
}[] = [
  { key: 'registered', label: 'Se registran' },
  { key: 'verified', label: 'Verifican el correo' },
  { key: 'withList', label: 'Crean su primera lista' },
  { key: 'withProduct', label: 'Añaden su primer producto' },
  { key: 'shared', label: 'Comparten una lista' },
];

/**
 * Contenido real de la pestaña Métricas del panel de administración
 * (fase 7): crecimiento, embudo de activación, actividad, vigilancia de
 * la última copia y uso de IA de los últimos 7 días, todo desde el
 * overview (GET /admin/metrics/overview). Una sola carga por visita, sin
 * polling: las métricas son series históricas y las lecturas admin
 * comparten 60 peticiones/15 min.
 *
 * Un tramo del embudo a null significa que el backend no lo pudo
 * calcular: se muestra como «sin datos», nunca se inventa un número.
 * Los bloques de adquisición, retención y plantillas son «Próximamente»
 * honestos: el backend no guarda esos datos todavía.
 */
export function AdminMetricsSection() {
  const { data, isLoading, isError } = useAdminMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Métricas de uso</h2>
        <div role="status" aria-label="Cargando métricas de uso…">
          <span className="sr-only">Cargando métricas de uso…</span>
          <SkeletonCard />
        </div>
        <div role="status" aria-label="Cargando gráfico de registros…">
          <span className="sr-only">Cargando gráfico de registros…</span>
          <SkeletonCard />
        </div>
        <div role="status" aria-label="Cargando embudo de activación…">
          <span className="sr-only">Cargando embudo de activación…</span>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Métricas de uso</h2>
        <p className="text-sm text-destructive">Error al cargar las métricas de uso.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Métricas de uso</h2>
      <GrowthCards data={data} />
      <RegistrationsChart data={data} />
      <FunnelCard funnel={data.funnel} />
      <BackupHealthCard data={data} />
      <AIUsageCard data={data} />
      <ComingSoonCards data={data} />
    </div>
  );
}

function GrowthCards({ data }: { data: MetricsOverviewDto }) {
  const registrations30d = sumCounts(data.growth.registrationsByDay);
  const lists30d = sumCounts(data.growth.listsByDay);
  const activeByDay = data.activity.activeUsersByDay;
  const activeToday = activeByDay.length > 0 ? activeByDay[activeByDay.length - 1].count : null;
  const active30d = sumCounts(activeByDay);
  const { totals } = data.growth;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Registros (30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{registrations30d}</p>
          <p className="text-xs text-muted-foreground">
            {totals.users} {totals.users === 1 ? 'usuario' : 'usuarios'} en total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Correo verificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{Math.round(totals.verifiedPct)} %</p>
          <p className="text-xs text-muted-foreground">
            {totals.verifiedUsers} de {totals.users}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Listas (30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{lists30d}</p>
          <p className="text-xs text-muted-foreground">
            {totals.lists} {totals.lists === 1 ? 'lista' : 'listas'} en total
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Productos con categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{Math.round(totals.categorizedPct)} %</p>
          <p className="text-xs text-muted-foreground">
            {totals.categorizedProducts} de {totals.products}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Usuarios activos hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{activeToday ?? '—'}</p>
          <p className="text-xs text-muted-foreground">
            {activeToday === null ? 'Sin datos aún' : 'con actividad hoy'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Usuarios activos (30 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{active30d}</p>
          <p className="text-xs text-muted-foreground">suma de activos por día</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RegistrationsChart({ data }: { data: MetricsOverviewDto }) {
  const [range, setRange] = useState<ChartRange>('day');

  const series =
    range === 'day'
      ? data.growth.registrationsByDay.map((point) => ({
          key: point.date,
          label: formatMetricsDayLabel(point.date),
          count: point.count,
        }))
      : data.growth.registrationsByMonth.map((point) => ({
          key: point.month,
          label: formatMetricsMonthLabel(point.month),
          count: point.count,
        }));
  const total = series.reduce((sum, point) => sum + point.count, 0);
  const maxCount = Math.max(...series.map((point) => point.count), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>
            {range === 'day'
              ? 'Registros por día (últimos 30 días)'
              : 'Registros por mes (últimos 12 meses)'}
          </CardTitle>
          <div className="flex gap-1" role="group" aria-label="Periodo del gráfico">
            <button
              type="button"
              aria-pressed={range === 'day'}
              onClick={() => setRange('day')}
              className={`px-3 py-1 rounded-md text-sm border ${range === 'day' ? 'bg-primary text-primary-foreground border-primary' : 'border-gray-300'}`}
            >
              Por día
            </button>
            <button
              type="button"
              aria-pressed={range === 'month'}
              onClick={() => setRange('month')}
              className={`px-3 py-1 rounded-md text-sm border ${range === 'month' ? 'bg-primary text-primary-foreground border-primary' : 'border-gray-300'}`}
            >
              Por mes
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin datos aún: todavía no hay registros en este periodo.
          </p>
        ) : (
          <div
            className="flex gap-1 items-end h-28"
            role="list"
            aria-label={
              range === 'day'
                ? 'Registros por día, últimos 30 días'
                : 'Registros por mes, últimos 12 meses'
            }
          >
            {series.map((point) => {
              const heightPct = Math.round((point.count / maxCount) * 100);
              return (
                <div
                  key={point.key}
                  role="listitem"
                  className="flex flex-1 flex-col items-center gap-1 h-full justify-end min-w-0"
                  title={`${point.label}: ${point.count} ${point.count === 1 ? 'registro' : 'registros'}`}
                >
                  <span className="text-xs text-muted-foreground">{point.count}</span>
                  <div
                    className="w-full max-w-9 rounded-t-md bg-primary"
                    style={{ height: `${heightPct}%` }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground truncate">
                    {point.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-3">
          {total} {total === 1 ? 'registro' : 'registros'} en el periodo ·{' '}
          {sumCounts(data.growth.listsByDay)} listas y {sumCounts(data.growth.productsByDay)}{' '}
          productos creados en los últimos 30 días.
        </p>
      </CardContent>
    </Card>
  );
}

function FunnelCard({ funnel }: { funnel: MetricsFunnelDto }) {
  const values = FUNNEL_STEPS.map((step) => funnel[step.key]);
  /** La base es el primer tramo; si no se pudo calcular, el mayor disponible. */
  const base =
    values[0] ?? Math.max(...values.filter((v): v is number => v !== null), 0);
  const hasAnyData = values.some((v) => v !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embudo de activación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasAnyData ? (
          <p className="text-sm text-muted-foreground">
            Sin datos aún: el embudo no se pudo calcular.
          </p>
        ) : (
          FUNNEL_STEPS.map((step, index) => {
            const value = values[index];
            const previous = index > 0 ? values[index - 1] : null;
            const widthPct =
              value !== null && base > 0 ? Math.round((value / base) * 100) : 0;
            const stepPct =
              value !== null && previous !== null && previous > 0
                ? Math.round((value / previous) * 100)
                : null;
            return (
              <div key={step.key} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 text-muted-foreground">{step.label}</span>
                <div className="h-5 flex-1 rounded bg-gray-100">
                  {value !== null && (
                    <div
                      className="h-full rounded bg-primary"
                      style={{ width: `${widthPct}%` }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="w-32 shrink-0 text-right">
                  {value === null ? (
                    'sin datos'
                  ) : (
                    <>
                      {value} ·{' '}
                      {index === 0
                        ? '100 %'
                        : stepPct !== null
                          ? `${stepPct} % del tramo anterior`
                          : '—'}
                    </>
                  )}
                </span>
              </div>
            );
          })
        )}
        <p className="text-sm text-muted-foreground">
          Cada tramo muestra cuántos llegan desde el anterior; un tramo «sin
          datos» es que el backend no lo pudo calcular, no que sea cero.
        </p>
      </CardContent>
    </Card>
  );
}

function BackupHealthCard({ data }: { data: MetricsOverviewDto }) {
  const { backupHealth } = data;
  const last = backupHealth.lastCreated;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Última copia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {backupHealth.stale && (
          <p
            className="text-sm text-destructive font-medium"
            role="alert"
          >
            La última copia es antigua: {backupHealth.reason ?? 'lleva más de 24 horas sin renovarse.'}
          </p>
        )}
        {!last ? (
          <p className="text-sm text-muted-foreground">Sin copias aún</p>
        ) : (
          <>
            <p className="text-sm">
              <span className="text-muted-foreground">Fecha: </span>
              {new Date(last.createdAt).toLocaleString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' · '}
              {formatBackupAge(last.ageHours)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Tamaño: </span>
              {formatBackupSize(last.sizeBytes)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Archivo: </span>
              {last.filename}
            </p>
          </>
        )}
        {!backupHealth.stale && last && (
          <p className="text-sm text-muted-foreground">
            Copia al día: la última tiene menos de 24 horas.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AIUsageCard({ data }: { data: MetricsOverviewDto }) {
  const usage = data.aiUsage7d;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de IA (últimos 7 días)</CardTitle>
      </CardHeader>
      <CardContent>
        {usage.total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin datos aún: todavía no hay peticiones de IA registradas en los
            últimos 7 días.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Peticiones</p>
              <p className="text-lg font-semibold">{usage.total}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Correctas</p>
              <p className="text-lg font-semibold">{usage.success}</p>
              <p className="text-xs text-muted-foreground">{usage.failed} fallidas</p>
            </div>
            <div>
              <p className="text-muted-foreground">Desde caché</p>
              <p className="text-lg font-semibold">
                {Math.round((usage.cached / usage.total) * 100)} %
              </p>
              <p className="text-xs text-muted-foreground">
                {usage.cached} servidas desde caché
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Media por día</p>
              <p className="text-lg font-semibold">
                {(usage.total / 7).toLocaleString('es-ES', { maximumFractionDigits: 1 })}
              </p>
              <p className="text-xs text-muted-foreground">peticiones al día</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComingSoonCards({ data }: { data: MetricsOverviewDto }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>
            Adquisición{' '}
            <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
              Próximamente
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hoy no se guarda de dónde viene cada registro. Haría falta guardar
            el origen (invitación, UTM) al registrarse.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Retención{' '}
            <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
              Próximamente
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.activity.retention.available
              ? 'La retención completa todavía no está disponible.'
              : data.activity.retention.reason}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Plantillas más usadas{' '}
            <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
              Próximamente
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            El backend no guarda cuántas veces se usa cada plantilla, así que
            no se puede ordenar por uso todavía.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
