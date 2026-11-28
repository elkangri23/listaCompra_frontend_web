/**
 * DTOs para Administración
 * Tipos relacionados con funcionalidades de administración del sistema
 *
 * Los DTOs de dashboard siguen EXACTAMENTE las respuestas reales del
 * backend (GET /dashboard/*): sobre `{status: 'success', data, timestamp}`
 * y payload en `data`. Si un dato no existe o es null, la UI muestra
 * "sin datos aún": nunca se inventa un valor.
 */

// ============================================================================
// Dashboard — Salud, métricas y rendimiento (GET /dashboard/*)
// ============================================================================

export type HealthLevel = 'healthy' | 'degraded' | 'unhealthy';

/**
 * GET /dashboard/health → data
 * uptime en milisegundos (Date.now() - startTime del backend).
 */
export interface HealthStatusDto {
  overall: HealthLevel;
  services: {
    api: HealthLevel;
    cache: HealthLevel;
    metrics: HealthLevel;
  };
  uptime: number;
  timestamp: string;
}

export interface EndpointMetricsDto {
  path: string;
  method: string;
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  totalResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  avgResponseTime: number;
  /** El backend serializa el Date como ISO string. */
  lastUpdated: string;
}

/**
 * Forma real de CacheAnalytics (RedisCacheAnalytics.getRealTimeMetrics):
 * hitRatio es tanto por uno (0-1). La caché puede no estar disponible:
 * entonces cacheMetrics es null o `{error: string}`.
 */
export interface CacheCategoryStatsDto {
  hits: number;
  misses: number;
  hitRatio: number;
  avgTTL: number;
}

export interface CacheAnalyticsDto {
  hits: number;
  misses: number;
  hitRatio: number;
  averageResponseTime: number;
  cacheResponseTime: number;
  apiResponseTime: number;
  totalOperations: number;
  readsPerMinute: number;
  writesPerMinute: number;
  /** Requests API evitadas por los hits. */
  costSavings: number;
  /** MB utilizados (aprox.). */
  spaceSavings: number;
  categoryStats: Record<string, CacheCategoryStatsDto>;
}

export type CacheMetricsDto = CacheAnalyticsDto | { error: string } | null;

export interface DashboardSystemMetricsDto {
  totalEndpoints: number;
  globalRequestCount: number;
  /** Porcentaje 0-100. */
  globalSuccessRate: number;
  globalAvgResponseTime: number;
  /** Milisegundos desde que arrancó la API. */
  uptime: number;
  /** El backend serializa el Date como ISO string. */
  startTime: string;
}

/** GET /dashboard/metrics → data */
export interface SystemMetricsDto {
  systemMetrics: DashboardSystemMetricsDto;
  endpointMetrics: EndpointMetricsDto[];
  cacheMetrics: CacheMetricsDto;
}

/** GET /dashboard/alerts → data */
export interface DashboardAlertDto {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

export interface DashboardAlertsDto {
  activeAlerts: DashboardAlertDto[];
  alertCount: number;
  timestamp: string;
}

export interface ErrorRateStatDto {
  path: string;
  method: string;
  /** Porcentaje 0-100. */
  errorRate: number;
  totalErrors: number;
}

/** GET /dashboard/performance → data */
export interface PerformanceMetricsDto {
  slowestEndpoints: EndpointMetricsDto[];
  errorProneEndpoints: EndpointMetricsDto[];
  errorRateStats: ErrorRateStatDto[];
  timestamp: string;
}

// ============================================================================
// User Management
// ============================================================================

export interface AdminUserDto {
  id: string;
  nombre: string;
  email: string;
  rol: 'USUARIO' | 'ADMIN';
  activo: boolean;
  emailVerificado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  // Estadísticas adicionales
  listasCreadas?: number;
  productosAgregados?: number;
  // El backend NO devuelve ultimaConexion hoy; si algún día la envía,
  // la tabla la muestra, y si no, la columna no aparece.
  ultimaConexion?: string;
}

export interface PaginatedAdminUsersDto {
  usuarios: AdminUserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserStatusDto {
  activo: boolean;
}

/**
 * POST /admin/impersonate — al menos uno de targetUserId / targetUserEmail.
 */
export interface ImpersonateUserDto {
  targetUserId?: string;
  targetUserEmail?: string;
  reason?: string;
  durationMinutes?: number;
}

/** POST /admin/impersonate → data */
export interface ImpersonateResponseDto {
  impersonationToken: string;
  impersonatedUser: {
    id: string;
    email: string;
    nombre: string;
    apellidos?: string;
  };
  adminUser: {
    id: string;
    email: string;
    nombre: string;
  };
  expiresAt: string;
  startedAt: string;
}

/** DELETE /admin/impersonate — cuerpo opcional. */
export interface EndImpersonationDto {
  sessionId?: string;
  reason?: string;
}

/** DELETE /admin/impersonate → data */
export interface EndImpersonationResponseDto {
  success: boolean;
  message: string;
  terminatedSession: {
    sessionId: string;
    adminId: string;
    targetUserId: string;
    startedAt: string;
    endedAt: string;
    /** Duración en formato legible, p. ej. "2h 15m". */
    duration: string;
  };
  /** Token original del administrador, restaurado. */
  adminToken: string;
}

// ============================================================================
// IA — Uso y salud (GET /ai/usage y GET /ai/health, fase 3)
// ============================================================================

export type AIOperation = 'category-suggestions' | 'bulk-categorize' | 'config-test';

export type AIUsageByOperationDto = Record<AIOperation, number>;

/** GET /ai/usage → data.today */
export interface AIUsageTodayDto {
  total: number;
  byOperation: AIUsageByOperationDto;
  success: number;
  failed: number;
  /** Latencia media en ms; null sin peticiones. */
  avgLatencyMs: number | null;
  cached: number;
  /** Porcentaje 0-100; null sin peticiones. */
  cachedPercentage: number | null;
}

/** GET /ai/usage → data.last7Days[i] (de más antiguo a más reciente). */
export interface AIUsageDayDto {
  /** Fecha 'YYYY-MM-DD'. */
  date: string;
  total: number;
  success: number;
  failed: number;
  byOperation: AIUsageByOperationDto;
}

/** GET /ai/usage → data. hasData false = todo a cero, sin uso real aún. */
export interface AIUsageDto {
  provider: string;
  model: string;
  today: AIUsageTodayDto;
  last7Days: AIUsageDayDto[];
  hasData: boolean;
}

/** GET /ai/health → data */
export interface AIHealthDto {
  status: 'healthy' | 'degraded';
  provider: string;
  model: string;
  /** Latencia en ms; null si no se pudo medir. */
  latencyMs: number | null;
  reason?: string;
  checkedAt: string;
  cached: boolean;
}

// ============================================================================
// Audit Logs (fase 4)
// ============================================================================
// La vista global de auditoría usa los tipos reales de la funcionalidad de
// auditoría (src/features/audit/types.ts): AuditHistoryResponse y
// AdminAuditFilters (en el servicio admin). Los DTOs de plantilla que había
// aquí (AuditLogDto, con action/entity/ipAddress) no existen en el backend.

// ============================================================================
// Security (fase 5)
// ============================================================================
// Formas REALES del backend (src/application/dto/admin/SecurityDto.ts):
// el overview deja una sección a null cuando no se puede calcular (nunca se
// inventa un valor), los login-attempts son paginados y las alertas se
// calculan con datos reales (BRUTE_FORCE_EMAIL, ADMIN_WITHOUT_2FA,
// GRACE_PERIOD_ENDING). Los DTOs de plantilla que había aquí (type
// failed_login/suspicious_activity/..., items, limit, timestamp, resolved)
// no existen en el backend.

export interface GracePeriodAccountDto {
  email: string;
  eliminacionSolicitadaEn: string;
  /** Días que quedan hasta la eliminación definitiva (30 días de gracia). */
  daysLeft: number;
}

export interface SecurityOverviewDto {
  /** Cuentas con 2FA sobre el total; null si no se pudo calcular. */
  twoFactor: { enabled: number; total: number } | null;
  /** Intentos fallidos en las últimas 24 h; null si no se pudo calcular. */
  failedLoginsLast24h: number | null;
  /** Turnstile está activo solo si TURNSTILE_SECRET_KEY está configurada. */
  turnstile: { enabled: boolean };
  /** Cuentas en periodo de gracia GDPR; null si no se pudo calcular. */
  gracePeriod: { count: number; accounts: GracePeriodAccountDto[] } | null;
  /** Motivos por sección cuando un dato no se pudo calcular. */
  unavailable: {
    twoFactor?: string;
    failedLogins?: string;
    gracePeriod?: string;
  };
}

export type LoginAttemptReason =
  | 'WRONG_PASSWORD'
  | 'USER_NOT_FOUND'
  | 'UNVERIFIED_EMAIL'
  | 'INACTIVE_ACCOUNT'
  | 'MFA_FAILED';

export interface LoginAttemptDto {
  id: string;
  email: string;
  success: boolean;
  reason: LoginAttemptReason | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PaginatedLoginAttemptsDto {
  attempts: LoginAttemptDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Filtros de GET /admin/security/login-attempts. */
export interface SecurityLoginAttemptFilters {
  email?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface SecurityAlertDto {
  id: string;
  type: 'BRUTE_FORCE_EMAIL' | 'ADMIN_WITHOUT_2FA' | 'GRACE_PERIOD_ENDING';
  severity: 'high' | 'medium' | 'low';
  message: string;
  /** Cuándo se originó el hecho que genera la alerta. */
  createdAt: string;
  relatedEmail?: string;
}

export interface PaginatedSecurityAlertsDto {
  alerts: SecurityAlertDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Copias de seguridad (fase 6)
// ============================================================================
// Formas REALES del backend (GET /api/v1/admin/backups, POST
// /api/v1/admin/backups, POST /api/v1/admin/backups/:id/restore): la lista
// viene ordenada por createdAt desc bajo el sobre {success, data}. No hay
// DTO de plantilla de copias: una copia PENDING aún no tiene tamaño ni
// archivo descargable, y restoreReason/restoredAt solo existen tras una
// restauración.

export type BackupStatus =
  | 'PENDING'
  | 'CREATED'
  | 'FAILED'
  | 'RESTORING'
  | 'RESTORED'
  | 'RESTORE_FAILED';

export type BackupSource = 'SCHEDULED' | 'MANUAL';

export interface BackupDto {
  id: string;
  filename: string;
  /** Bytes del .sql.gz; null mientras la copia aún se está creando. */
  sizeBytes: number | null;
  status: BackupStatus;
  source: BackupSource;
  createdAt: string;
  createdByUserId: string | null;
  /** Motivo que dio el admin al restaurar; null si nunca se restauró. */
  restoreReason: string | null;
  /** Cuándo se restauró; null si nunca se restauró. */
  restoredAt: string | null;
}

export interface PaginatedBackupsDto {
  backups: BackupDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** POST /admin/backups y POST /admin/backups/:id/restore → data */
export interface BackupResponseDto {
  backup: BackupDto;
}

/** POST /admin/backups/:id/restore — la confirmación es literal. */
export interface RestoreBackupDto {
  confirmacion: 'RESTAURAR';
  motivo: string;
}

// ============================================================================
// Métricas de uso (fase 7)
// ============================================================================
// Formas REALES del backend (GET /api/v1/admin/metrics/overview): el
// overview responde `{success, data}` con crecimiento, embudo, actividad,
// salud de la copia y uso de IA de los últimos 7 días. Cualquier tramo del
// embudo puede venir a null si el backend no lo pudo calcular: la UI lo
// muestra como «sin datos», nunca inventa un número.

/** Un día de una serie: fecha 'YYYY-MM-DD' y conteo (con ceros). */
export interface MetricsDayCountDto {
  date: string;
  count: number;
}

/** Un mes de una serie: mes 'YYYY-MM' y conteo (con ceros). */
export interface MetricsMonthCountDto {
  month: string;
  count: number;
}

export interface MetricsGrowthDto {
  registrationsByDay: MetricsDayCountDto[];
  registrationsByMonth: MetricsMonthCountDto[];
  listsByDay: MetricsDayCountDto[];
  productsByDay: MetricsDayCountDto[];
  totals: {
    users: number;
    verifiedUsers: number;
    /** Porcentaje 0-100. */
    verifiedPct: number;
    lists: number;
    products: number;
    categorizedProducts: number;
    /** Porcentaje 0-100. */
    categorizedPct: number;
  };
}

/** Embudo de activación; un tramo a null = el backend no lo pudo calcular. */
export interface MetricsFunnelDto {
  registered: number | null;
  verified: number | null;
  withList: number | null;
  withProduct: number | null;
  shared: number | null;
}

export interface MetricsActivityDto {
  activeUsersByDay: MetricsDayCountDto[];
  retention: {
    available: boolean;
    reason: string;
  };
}

export interface MetricsBackupHealthDto {
  lastCreated: {
    id: string;
    filename: string;
    sizeBytes: number;
    createdAt: string;
    /** Horas desde que se creó la copia. */
    ageHours: number;
  } | null;
  stale: boolean;
  reason: string | null;
}

export interface MetricsAIUsageDayDto {
  /** Fecha 'YYYY-MM-DD'. */
  date: string;
  total: number;
  success: number;
}

export interface MetricsAIUsage7dDto {
  total: number;
  success: number;
  failed: number;
  cached: number;
  byDay: MetricsAIUsageDayDto[];
}

/** GET /admin/metrics/overview → data */
export interface MetricsOverviewDto {
  growth: MetricsGrowthDto;
  funnel: MetricsFunnelDto;
  activity: MetricsActivityDto;
  backupHealth: MetricsBackupHealthDto;
  aiUsage7d: MetricsAIUsage7dDto;
}
