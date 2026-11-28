import { axiosInstance } from '@/lib/api/axios-instance';
import type { AuditHistoryFilters, AuditHistoryResponse } from '@/features/audit/types';
import type {
  SystemMetricsDto,
  PaginatedAdminUsersDto,
  UpdateUserStatusDto,
  ImpersonateUserDto,
  ImpersonateResponseDto,
  EndImpersonationDto,
  EndImpersonationResponseDto,
  PaginatedSecurityAlertsDto,
  SecurityOverviewDto,
  PaginatedLoginAttemptsDto,
  SecurityLoginAttemptFilters,
  PerformanceMetricsDto,
  HealthStatusDto,
  DashboardAlertsDto,
  AIUsageDto,
  AIHealthDto,
  PaginatedBackupsDto,
  BackupResponseDto,
  RestoreBackupDto,
} from '@/types/dtos/admin';

/** Filtros de la vista global de auditoría (fase 4). */
export interface AdminAuditFilters extends AuditHistoryFilters {
  /** 'Lista' | 'Producto'. En producción no hay eventos de Usuario. */
  entityType?: 'Lista' | 'Producto';
}

/**
 * Servicio de administración del sistema
 * Funcionalidades para admins: métricas, usuarios, auditoría, impersonación
 *
 * Los endpoints de dashboard responden `{status: 'success', data, timestamp}`
 * (sobre distinta a `{success, data}` del resto de la API): el payload está
 * en `response.data.data`. Los de /admin/* responden `{success, data}`.
 */

// ============================================================================
// Dashboard Metrics
// ============================================================================

/**
 * Obtener métricas generales del sistema
 */
export const getSystemMetrics = async (): Promise<SystemMetricsDto> => {
  const response = await axiosInstance.get<{ status: string; data: SystemMetricsDto }>(
    '/dashboard/metrics'
  );
  return response.data.data;
};

/**
 * Obtener estado de salud del sistema
 */
export const getHealthStatus = async (): Promise<HealthStatusDto> => {
  const response = await axiosInstance.get<{ status: string; data: HealthStatusDto }>(
    '/dashboard/health'
  );
  return response.data.data;
};

/**
 * Obtener métricas de rendimiento
 */
export const getPerformanceMetrics = async (): Promise<PerformanceMetricsDto> => {
  const response = await axiosInstance.get<{ status: string; data: PerformanceMetricsDto }>(
    '/dashboard/performance'
  );
  return response.data.data;
};

/**
 * Obtener alertas activas del sistema
 */
export const getAlerts = async (): Promise<DashboardAlertsDto> => {
  const response = await axiosInstance.get<{ status: string; data: DashboardAlertsDto }>(
    '/dashboard/alerts'
  );
  return response.data.data;
};

// ============================================================================
// AI — Uso y salud (fase 3)
// ============================================================================

/**
 * Obtener uso real de IA (solo ADMIN).
 * GET /ai/usage → {success, data}; hasData false = sin uso aún.
 */
export const getAIUsage = async (): Promise<AIUsageDto> => {
  const response = await axiosInstance.get<{ success: boolean; data: AIUsageDto }>(
    '/ai/usage'
  );
  return response.data.data;
};

/**
 * Obtener salud del proveedor de IA.
 * GET /ai/health → {success, data}.
 */
export const getAIHealth = async (): Promise<AIHealthDto> => {
  const response = await axiosInstance.get<{ success: boolean; data: AIHealthDto }>(
    '/ai/health'
  );
  return response.data.data;
};

// ============================================================================
// User Management
// ============================================================================

/**
 * Obtener lista de usuarios (admin)
 */
export const getAdminUsers = async (
  query?: string,
  page = 1,
  limit = 20
): Promise<PaginatedAdminUsersDto> => {
  const response = await axiosInstance.get<{ success: boolean; data: PaginatedAdminUsersDto }>(
    '/admin/users',
    {
      params: { q: query, page, limit },
    }
  );
  return response.data.data;
};

/**
 * Actualizar estado de un usuario (activar/desactivar)
 */
export const updateUserStatus = async (
  userId: string,
  activo: boolean
): Promise<void> => {
  await axiosInstance.patch(`/admin/users/${userId}/status`, { activo } as UpdateUserStatusDto);
};

/**
 * Impersonar usuario (admin actúa como otro usuario).
 * POST /admin/impersonate con {targetUserId} en el cuerpo.
 */
export const impersonateUser = async (userId: string): Promise<ImpersonateResponseDto> => {
  const response = await axiosInstance.post<{ success: boolean; data: ImpersonateResponseDto }>(
    '/admin/impersonate',
    { targetUserId: userId } as ImpersonateUserDto
  );
  return response.data.data;
};

/**
 * Finalizar impersonación.
 * DELETE /admin/impersonate; devuelve el token original del admin en
 * data.adminToken. El cuerpo es opcional (sessionId / reason).
 */
export const endImpersonation = async (
  body?: EndImpersonationDto
): Promise<EndImpersonationResponseDto> => {
  const response = await axiosInstance.delete<{
    success: boolean;
    data: EndImpersonationResponseDto;
  }>('/admin/impersonate', { data: body ?? {} });
  return response.data.data;
};

// ============================================================================
// Audit Logs
// ============================================================================

/**
 * Vista global de auditoría (fase 4).
 * GET /admin/audit-logs → {success, data: {entries, total, page, pageSize, totalPages}}.
 */
export const getAuditLogs = async (
  filters?: AdminAuditFilters,
  page = 1,
  limit = 20
): Promise<AuditHistoryResponse> => {
  const response = await axiosInstance.get<{ success: boolean; data: AuditHistoryResponse }>(
    '/admin/audit-logs',
    {
      params: { ...filters, page, pageSize: limit },
    }
  );
  return response.data.data;
};

// ============================================================================
// Security (fase 5)
// ============================================================================

/**
 * Resumen de seguridad (fase 5).
 * GET /admin/security/overview → {success, data: SecurityOverviewDto}.
 */
export const getSecurityOverview = async (): Promise<SecurityOverviewDto> => {
  const response = await axiosInstance.get<{ success: boolean; data: SecurityOverviewDto }>(
    '/admin/security/overview'
  );
  return response.data.data;
};

/**
 * Intentos de inicio de sesión (fase 5).
 * GET /admin/security/login-attempts → {success, data: {attempts, total,
 * page, pageSize, totalPages}}. Filtros: email, success, startDate, endDate.
 */
export const getLoginAttempts = async (
  filters?: SecurityLoginAttemptFilters,
  page = 1,
  limit = 20
): Promise<PaginatedLoginAttemptsDto> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: PaginatedLoginAttemptsDto;
  }>('/admin/security/login-attempts', {
    params: { ...filters, page, pageSize: limit },
  });
  return response.data.data;
};

/**
 * Alertas de seguridad (fase 5): calculadas en el backend con datos reales
 * (fuerza bruta, admin sin 2FA, periodo de gracia a punto de vencer).
 * GET /admin/security/alerts → {success, data: {alerts, total, page,
 * pageSize, totalPages}}. Si no hay ninguna, la lista viene vacía.
 */
export const getSecurityAlerts = async (
  page = 1,
  limit = 20
): Promise<PaginatedSecurityAlertsDto> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: PaginatedSecurityAlertsDto;
  }>('/admin/security/alerts', {
    params: { page, pageSize: limit },
  });
  return response.data.data;
};

// ============================================================================
// Copias de seguridad (fase 6)
// ============================================================================

/**
 * Historial de copias de seguridad (fase 6), ordenado por createdAt desc.
 * GET /admin/backups → {success, data: {backups, total, page, pageSize,
 * totalPages}}.
 */
export const getBackups = async (
  page = 1,
  limit = 20
): Promise<PaginatedBackupsDto> => {
  const response = await axiosInstance.get<{
    success: boolean;
    data: PaginatedBackupsDto;
  }>('/admin/backups', {
    params: { page, pageSize: limit },
  });
  return response.data.data;
};

/**
 * Solicitar una copia manual (fase 6).
 * POST /admin/backups → 201 {success, data: {backup}} con status PENDING
 * y source MANUAL. 409 si ya hay una PENDING en curso.
 */
export const createBackup = async (): Promise<BackupResponseDto> => {
  const response = await axiosInstance.post<{ success: boolean; data: BackupResponseDto }>(
    '/admin/backups'
  );
  return response.data.data;
};

/**
 * Descargar el .sql.gz de una copia (fase 6). La descarga va con el token
 * de sesión: se pide con responseType 'blob' a través del cliente axios
 * del proyecto (mismo patrón que la exportación GDPR), nunca con un
 * <a href> pelado, que iría sin token.
 * GET /admin/backups/:id/download → 200 binario .sql.gz.
 */
export const downloadBackup = async (id: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/admin/backups/${id}/download`, {
    responseType: 'blob',
  });
  return response.data as Blob;
};

/**
 * Restaurar una copia (fase 6).
 * POST /admin/backups/:id/restore {confirmacion: 'RESTAURAR', motivo} →
 * 202 {success, data: {backup}} con status RESTORING. 400 si la
 * confirmación no es exactamente RESTAURAR o el motivo está vacío.
 */
export const restoreBackup = async (
  id: string,
  body: RestoreBackupDto
): Promise<BackupResponseDto> => {
  const response = await axiosInstance.post<{
    success: boolean;
    data: BackupResponseDto;
  }>(`/admin/backups/${id}/restore`, body);
  return response.data.data;
};

export const adminService = {
  // Dashboard
  getSystemMetrics,
  getHealthStatus,
  getPerformanceMetrics,
  getAlerts,
  // AI
  getAIUsage,
  getAIHealth,
  // Users
  getAdminUsers,
  updateUserStatus,
  impersonateUser,
  endImpersonation,
  // Audit
  getAuditLogs,
  // Security
  getSecurityOverview,
  getLoginAttempts,
  getSecurityAlerts,
  // Copias de seguridad
  getBackups,
  createBackup,
  downloadBackup,
  restoreBackup,
};
