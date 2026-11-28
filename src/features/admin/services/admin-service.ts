import { axiosInstance } from '@/lib/api/axios-instance';
import type {
  SystemMetricsDto,
  PaginatedAdminUsersDto,
  UpdateUserStatusDto,
  ImpersonateUserDto,
  ImpersonateResponseDto,
  EndImpersonationDto,
  EndImpersonationResponseDto,
  PaginatedAuditLogsDto,
  AuditLogFiltersDto,
  PaginatedSecurityAlertsDto,
  PerformanceMetricsDto,
  HealthStatusDto,
  DashboardAlertsDto,
} from '@/types/dtos/admin';

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
 * Obtener logs de auditoría con filtros
 */
export const getAuditLogs = async (
  filters?: AuditLogFiltersDto,
  page = 1,
  limit = 20
): Promise<PaginatedAuditLogsDto> => {
  const response = await axiosInstance.get<PaginatedAuditLogsDto>('/admin/audit-logs', {
    params: { ...filters, page, limit },
  });
  return response.data;
};

/**
 * Obtener alertas de seguridad
 */
export const getSecurityAlerts = async (
  page = 1,
  limit = 20
): Promise<PaginatedSecurityAlertsDto> => {
  const response = await axiosInstance.get<PaginatedSecurityAlertsDto>('/admin/security/alerts', {
    params: { page, limit },
  });
  return response.data;
};

export const adminService = {
  // Dashboard
  getSystemMetrics,
  getHealthStatus,
  getPerformanceMetrics,
  getAlerts,
  // Users
  getAdminUsers,
  updateUserStatus,
  impersonateUser,
  endImpersonation,
  // Audit
  getAuditLogs,
  getSecurityAlerts,
};
