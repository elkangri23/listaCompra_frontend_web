import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin-service';
import { toast } from 'sonner';
import type { AuditLogFiltersDto } from '@/types/dtos/admin';

// ============================================================================
// Dashboard Hooks
// ============================================================================

/**
 * Hook para obtener métricas del sistema
 */
export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: adminService.getSystemMetrics,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

/**
 * Hook para obtener estado de salud del sistema
 */
export const useHealthStatus = () => {
  return useQuery({
    queryKey: ['admin', 'health'],
    queryFn: adminService.getHealthStatus,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refetch cada minuto
  });
};

/**
 * Hook para obtener métricas de rendimiento
 */
export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: ['admin', 'performance'],
    queryFn: adminService.getPerformanceMetrics,
    staleTime: 1000 * 60, // 1 minuto
  });
};

/**
 * Hook para obtener alertas activas del sistema (GET /dashboard/alerts)
 */
export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: adminService.getAlerts,
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60, // Refetch cada minuto
  });
};

// ============================================================================
// AI Hooks (fase 3)
// ============================================================================

/**
 * Hook para obtener el uso real de IA (GET /ai/usage)
 */
export const useAIUsage = () => {
  return useQuery({
    queryKey: ['admin', 'ai', 'usage'],
    queryFn: adminService.getAIUsage,
    staleTime: 1000 * 60, // 1 minuto
  });
};

/**
 * Hook para obtener la salud del proveedor de IA (GET /ai/health)
 */
export const useAIHealth = () => {
  return useQuery({
    queryKey: ['admin', 'ai', 'health'],
    queryFn: adminService.getAIHealth,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // Refetch cada minuto
  });
};

// ============================================================================
// User Management Hooks
// ============================================================================

/**
 * Hook para obtener lista de usuarios (admin)
 */
export const useAdminUsers = (query?: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'users', query, page, limit],
    queryFn: () => adminService.getAdminUsers(query, page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para actualizar estado de usuario
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, activo }: { userId: string; activo: boolean }) =>
      adminService.updateUserStatus(userId, activo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'metrics'] });
      toast.success(
        variables.activo
          ? 'Usuario activado correctamente'
          : 'Usuario desactivado correctamente'
      );
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar estado: ${error.message}`);
    },
  });
};

/**
 * Hook para impersonar usuario
 */
export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: (userId: string) => adminService.impersonateUser(userId),
    onSuccess: (data) => {
      toast.success(`Impersonando a ${data.impersonatedUser.nombre}`);
      // Guardar token de impersonación
      localStorage.setItem('impersonation_token', data.impersonationToken);
      localStorage.setItem('original_user_id', data.adminUser.id);
      // Recargar la página para aplicar el nuevo contexto
      window.location.href = '/dashboard';
    },
    onError: (error: Error) => {
      toast.error(`Error al impersonar usuario: ${error.message}`);
    },
  });
};

/**
 * Hook para finalizar impersonación
 */
export const useEndImpersonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminService.endImpersonation(),
    onSuccess: (data) => {
      toast.success(data.message);
      // Limpiar tokens de impersonación
      localStorage.removeItem('impersonation_token');
      localStorage.removeItem('original_user_id');
      // Invalidar todas las queries
      queryClient.invalidateQueries();
      // Recargar para restaurar contexto original
      window.location.href = '/admin/users';
    },
    onError: (error: Error) => {
      toast.error(`Error al finalizar impersonación: ${error.message}`);
    },
  });
};

// ============================================================================
// Audit Logs Hooks
// ============================================================================

/**
 * Hook para obtener logs de auditoría
 */
export const useAuditLogs = (filters?: AuditLogFiltersDto, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'audit-logs', filters, page, limit],
    queryFn: () => adminService.getAuditLogs(filters, page, limit),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para obtener alertas de seguridad
 */
export const useSecurityAlerts = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'security-alerts', page, limit],
    queryFn: () => adminService.getSecurityAlerts(page, limit),
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 * 2, // Refetch cada 2 minutos
  });
};
