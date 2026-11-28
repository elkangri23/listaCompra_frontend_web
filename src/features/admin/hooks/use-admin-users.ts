import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin-service';
import type { AdminAuditFilters } from '../services/admin-service';
import type { SecurityLoginAttemptFilters } from '@/types/dtos/admin';
import { toast } from 'sonner';

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
 * Hook para obtener la vista global de auditoría (fase 4).
 * Filtros reales del endpoint: entityType ('Lista' | 'Producto'),
 * changeType, changedByUserId, startDate, endDate.
 */
export const useAuditLogs = (filters?: AdminAuditFilters, page = 1, limit = 20) => {
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

/**
 * Hook para obtener el resumen de seguridad (fase 5): 2FA, fallos 24 h,
 * Turnstile y cuentas en periodo de gracia.
 */
export const useSecurityOverview = () => {
  return useQuery({
    queryKey: ['admin', 'security-overview'],
    queryFn: adminService.getSecurityOverview,
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 * 2, // Refetch cada 2 minutos
  });
};

/**
 * Hook para obtener los intentos de inicio de sesión (fase 5), con filtros
 * (email, resultado, fechas) y paginación.
 */
export const useLoginAttempts = (
  filters?: SecurityLoginAttemptFilters,
  page = 1,
  limit = 20
) => {
  return useQuery({
    queryKey: ['admin', 'security-login-attempts', filters, page, limit],
    queryFn: () => adminService.getLoginAttempts(filters, page, limit),
    staleTime: 1000 * 60, // 1 minuto
  });
};

// ============================================================================
// Copias de seguridad Hooks (fase 6)
// ============================================================================

/**
 * Hay trabajo en curso (una copia creándose o restaurándose) mientras
 * alguna copia esté PENDING o RESTORING: solo entonces se revalida la
 * lista, nunca con un polling permanente.
 */
export const backupsHaveActiveWork = (backups: { status: string }[]): boolean =>
  backups.some((b) => b.status === 'PENDING' || b.status === 'RESTORING');

/** Mensaje del backend cuando lo trae (p. ej. el 409 de «ya hay una copia en curso»). */
function errorMessage(error: unknown): string {
  const axiosError = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return axiosError.response?.data?.message ?? axiosError.message ?? 'Error desconocido';
}

/**
 * Hook para obtener el historial de copias (fase 6), con paginación.
 * Mientras haya una copia PENDING o RESTORING, revalida cada 120 s para
 * ver cómo avanza; en cuanto termina, el refresco automático se detiene.
 * El intervalo es de 120 s (no 15 s) a propósito: el watcher del host solo
 * pasa cada 5 min, así que sondear más rápido no adelanta nada, y con 15 s
 * la pestaña agotaba el presupuesto del limitador admin (10/15 min) y
 * recibía 429 antes de que la copia terminara (arreglo 2026-11-28).
 */
export const useBackups = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['admin', 'backups', page, limit],
    queryFn: () => adminService.getBackups(page, limit),
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: (query) =>
      backupsHaveActiveWork(query.state.data?.backups ?? []) ? 1000 * 120 : false,
  });
};

/**
 * Hook para solicitar una copia manual. Al crearla se refresca la lista
 * para mostrar la PENDING; el 409 («ya hay una copia en curso») muestra
 * el mensaje del backend.
 */
export const useCreateBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminService.createBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'backups'] });
      toast.success('Copia solicitada: se está creando, actualiza en unos minutos');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear la copia: ${errorMessage(error)}`);
    },
  });
};

/**
 * Hook para descargar el .sql.gz de una copia. El servicio devuelve el
 * Blob (con el token de sesión); el enlace de descarga lo dispara el
 * componente que llama a este hook.
 */
export const useDownloadBackup = () => {
  return useMutation({
    mutationFn: ({ id }: { id: string; filename: string }) =>
      adminService.downloadBackup(id),
    onError: (error: Error) => {
      toast.error(`Error al descargar la copia: ${errorMessage(error)}`);
    },
  });
};

/**
 * Hook para restaurar una copia. Al aceptarla se refresca la lista para
 * mostrar la copia en RESTORING.
 */
export const useRestoreBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      adminService.restoreBackup(id, { confirmacion: 'RESTAURAR', motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'backups'] });
      toast.success('Restauración iniciada: la copia se está restaurando');
    },
    onError: (error: Error) => {
      toast.error(`Error al restaurar la copia: ${errorMessage(error)}`);
    },
  });
};
