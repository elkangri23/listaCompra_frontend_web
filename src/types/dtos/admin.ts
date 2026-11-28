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
// Audit Logs
// ============================================================================

export interface AuditLogDto {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PaginatedAuditLogsDto {
  logs: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogFiltersDto {
  userId?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Security Alerts
// ============================================================================

export interface SecurityAlertDto {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  userName?: string;
  ipAddress: string;
  timestamp: string;
  resolved: boolean;
}

export interface PaginatedSecurityAlertsDto {
  alerts: SecurityAlertDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
