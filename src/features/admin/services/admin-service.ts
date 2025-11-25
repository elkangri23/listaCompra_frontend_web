import { axiosInstance } from '@/lib/api/axios-instance';
import type {
  SystemMetricsDto,
  PaginatedAdminUsersDto,
  UpdateUserStatusDto,
  ImpersonateUserDto,
  ImpersonateResponseDto,
  EndImpersonationResponseDto,
  PaginatedAuditLogsDto,
  AuditLogFiltersDto,
  PaginatedSecurityAlertsDto,
  PerformanceMetricsDto,
  HealthStatusDto,
} from '@/types/dtos/admin';

/**
 * Servicio de administración del sistema
 * Funcionalidades para admins: métricas, usuarios, auditoría, impersonación
 */

// ============================================================================
// Dashboard Metrics
// ============================================================================

/**
 * Obtener métricas generales del sistema
 */
export const getSystemMetrics = async (): Promise<SystemMetricsDto> => {
  const response = await axiosInstance.get<SystemMetricsDto>('/dashboard/metrics');
  return response.data;
};

/**
 * Obtener estado de salud del sistema
 */
export const getHealthStatus = async (): Promise<HealthStatusDto> => {
  const response = await axiosInstance.get<HealthStatusDto>('/dashboard/health');
  return response.data;
};

/**
 * Obtener métricas de rendimiento
 */
export const getPerformanceMetrics = async (): Promise<PerformanceMetricsDto> => {
  const response = await axiosInstance.get<PerformanceMetricsDto>('/dashboard/performance');
  return response.data;
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
  const response = await axiosInstance.get<PaginatedAdminUsersDto>('/admin/users', {
    params: { q: query, page, limit },
  });
  return response.data;
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
 * Impersonar usuario (admin actúa como otro usuario)
 */
export const impersonateUser = async (userId: string): Promise<ImpersonateResponseDto> => {
  const response = await axiosInstance.post<ImpersonateResponseDto>(
    '/admin/impersonate/:userId'.replace(':userId', userId),
    {} as ImpersonateUserDto
  );
  return response.data;
};

/**
 * Finalizar impersonación
 */
export const endImpersonation = async (): Promise<EndImpersonationResponseDto> => {
  const response = await axiosInstance.post<EndImpersonationResponseDto>(
    '/admin/end-impersonation',
    {}
  );
  return response.data;
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
  // Users
  getAdminUsers,
  updateUserStatus,
  impersonateUser,
  endImpersonation,
  // Audit
  getAuditLogs,
  getSecurityAlerts,
};
