'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SkeletonCard, SkeletonRow } from '@/components/ui/skeleton';
import {
  useLoginAttempts,
  useSecurityAlerts,
  useSecurityOverview,
} from '@/features/admin/hooks/use-admin-users';
import type {
  LoginAttemptDto,
  LoginAttemptReason,
  SecurityAlertDto,
  SecurityLoginAttemptFilters,
} from '@/types/dtos/admin';

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const REASON_LABEL: Record<LoginAttemptReason, string> = {
  WRONG_PASSWORD: 'Contraseña incorrecta',
  USER_NOT_FOUND: 'Usuario inexistente',
  UNVERIFIED_EMAIL: 'Correo sin verificar',
  INACTIVE_ACCOUNT: 'Cuenta inactiva',
  MFA_FAILED: 'Código MFA incorrecto',
};

const ALERT_LABEL: Record<SecurityAlertDto['type'], string> = {
  BRUTE_FORCE_EMAIL: 'Fuerza bruta',
  ADMIN_WITHOUT_2FA: 'Admin sin 2FA',
  GRACE_PERIOD_ENDING: 'Periodo de gracia',
};

const SEVERITY_BADGE: Record<SecurityAlertDto['severity'], string> = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-blue-100 text-blue-800',
};

const SEVERITY_LABEL: Record<SecurityAlertDto['severity'], string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

/**
 * Dispositivo aproximado a partir del User-Agent (solo para mostrar «desde
 * dónde» se intentó entrar; nunca se registra el agente completo como
 * identificador de persona).
 */
function deviceFromUserAgent(userAgent: string | null): string {
  if (!userAgent) return 'Desconocido';
  if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'Móvil';
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh/i.test(userAgent)) return 'Mac';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'Navegador';
}

/**
 * Contenido real de la pestaña Seguridad del panel de administración
 * (fase 5): resumen (2FA, fallos 24 h, Turnstile, periodo de gracia),
 * alertas calculadas con datos reales y tabla de intentos de inicio de
 * sesión con filtros y paginación.
 *
 * Si un dato no se pudo calcular, el backend lo devuelve como null y aquí
 * se muestra «sin datos aún»: nunca se inventa un valor. Si no hay
 * alertas, la lista está vacía (no se inventan alertas).
 */
export function AdminSecuritySection() {
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState<'ALL' | 'true' | 'false'>('ALL');

  const overviewQuery = useSecurityOverview();
  const alertsQuery = useSecurityAlerts(1, 20);

  const filters = useMemo<SecurityLoginAttemptFilters>(
    () => ({
      ...(emailFilter.trim() ? { email: emailFilter.trim() } : {}),
      ...(successFilter !== 'ALL' ? { success: successFilter === 'true' } : {}),
    }),
    [emailFilter, successFilter]
  );
  const attemptsQuery = useLoginAttempts(filters, attemptsPage, 10);

  const overview = overviewQuery.data;
  const alerts = alertsQuery.data?.alerts || [];
  const attempts = attemptsQuery.data?.attempts || [];
  const attemptsTotalPages = attemptsQuery.data?.totalPages || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Seguridad</h2>

      {/* Resumen: las 4 tarjetas de la vista previa */}
      {overviewQuery.isLoading ? (
        <div
          role="status"
          aria-label="Cargando resumen de seguridad…"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <span className="sr-only">Cargando resumen de seguridad…</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : overviewQuery.isError || !overview ? (
        <p className="text-sm text-destructive">Error al cargar el resumen de seguridad.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Cuentas con 2FA</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.twoFactor ? (
                <>
                  <p className="text-2xl font-bold">
                    {overview.twoFactor.enabled} de {overview.twoFactor.total}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {overview.twoFactor.total - overview.twoFactor.enabled} sin 2FA
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">sin datos aún</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Intentos fallidos (24 h)</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.failedLoginsLast24h !== null ? (
                <p className="text-2xl font-bold">{overview.failedLoginsLast24h}</p>
              ) : (
                <p className="text-sm text-muted-foreground">sin datos aún</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Captcha Turnstile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {overview.turnstile.enabled ? 'Activado' : 'Desactivado'}
              </p>
              <p className="text-sm text-muted-foreground">
                {overview.turnstile.enabled ? 'Clave configurada' : 'Clave no configurada'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cuentas en periodo de gracia</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.gracePeriod ? (
                <>
                  <p className="text-2xl font-bold">{overview.gracePeriod.count}</p>
                  {overview.gracePeriod.accounts.map((account) => (
                    <p key={account.email} className="text-sm text-muted-foreground">
                      {account.email} ·{' '}
                      {account.daysLeft >= 0
                        ? `quedan ${account.daysLeft} días`
                        : `vencido hace ${-account.daysLeft} días`}
                    </p>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">sin datos aún</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas calculadas con datos reales */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas de seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alertsQuery.isLoading ? (
            <div role="status" aria-label="Cargando alertas…">
              <span className="sr-only">Cargando alertas…</span>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : alertsQuery.isError || !alertsQuery.data ? (
            <p className="text-sm text-destructive">Error al cargar las alertas.</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No hay alertas de seguridad.
            </p>
          ) : (
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex flex-wrap items-start gap-2 text-sm">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_BADGE[alert.severity]}`}
                  >
                    {SEVERITY_LABEL[alert.severity]} · {ALERT_LABEL[alert.type]}
                  </span>
                  <span className="text-gray-900">{alert.message}</span>
                  {alert.relatedEmail && (
                    <span className="text-gray-500">{alert.relatedEmail}</span>
                  )}
                  <span className="text-gray-500">{formatDate(alert.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
          {alertsQuery.data && alertsQuery.data.total > alerts.length && (
            <p className="text-sm text-muted-foreground">
              {alertsQuery.data.total - alerts.length} alertas más (página 1 de{' '}
              {alertsQuery.data.totalPages}).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Últimos inicios de sesión */}
      <Card>
        <CardHeader>
          <CardTitle>Últimos inicios de sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setAttemptsPage(1);
              }}
              placeholder="Filtrar por email…"
              aria-label="Filtrar intentos por email"
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
            />
            <select
              value={successFilter}
              onChange={(e) => {
                setSuccessFilter(e.target.value as 'ALL' | 'true' | 'false');
                setAttemptsPage(1);
              }}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
              aria-label="Filtrar por resultado"
            >
              <option value="ALL">Todos los resultados</option>
              <option value="true">Correctos</option>
              <option value="false">Fallidos</option>
            </select>
          </div>

          {attemptsQuery.isLoading ? (
            <div role="status" aria-label="Cargando intentos de inicio de sesión…">
              <span className="sr-only">Cargando intentos de inicio de sesión…</span>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : attemptsQuery.isError || !attemptsQuery.data ? (
            <p className="text-sm text-destructive">
              Error al cargar los intentos de inicio de sesión.
            </p>
          ) : attempts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No hay intentos con estos filtros.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cuándo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt: LoginAttemptDto) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(attempt.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">{attempt.email}</TableCell>
                      <TableCell>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                            attempt.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {attempt.success ? 'Correcto' : 'Fallido'}
                        </span>
                        {attempt.reason && (
                          <p className="text-sm text-gray-500">{REASON_LABEL[attempt.reason]}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <p className="text-gray-900">{deviceFromUserAgent(attempt.userAgent)}</p>
                        {attempt.ipAddress && (
                          <p className="text-gray-500">{attempt.ipAddress}</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground">
                {attemptsQuery.data.total}{' '}
                {attemptsQuery.data.total === 1 ? 'intento' : 'intentos'} en total
              </p>
            </>
          )}

          {attemptsTotalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setAttemptsPage((p) => Math.max(1, p - 1))}
                disabled={attemptsPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-gray-500">
                Página {attemptsPage} de {attemptsTotalPages}
              </span>
              <button
                type="button"
                onClick={() => setAttemptsPage((p) => Math.min(attemptsTotalPages, p + 1))}
                disabled={attemptsPage >= attemptsTotalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Cada intento de inicio de sesión queda registrado (correcto o fallido, con
        su motivo); nunca se guardan contraseñas ni códigos.
      </p>
    </div>
  );
}
