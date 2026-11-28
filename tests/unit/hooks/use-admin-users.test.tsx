/**
 * Tests CRÍTICOS (100% coverage) - use-admin-users.ts
 * Hooks de React Query para administración del sistema
 *
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react-hooks
 * Mock: adminService, toast, localStorage
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminService } from '@/features/admin/services/admin-service';
import {
  useSystemMetrics,
  useHealthStatus,
  usePerformanceMetrics,
  useDashboardAlerts,
  useAIUsage,
  useAIHealth,
  useAdminUsers,
  useUpdateUserStatus,
  useImpersonateUser,
  useEndImpersonation,
  useAuditLogs,
  useSecurityAlerts,
  useSecurityOverview,
  useLoginAttempts,
  useBackups,
  useCreateBackup,
  useDownloadBackup,
  useRestoreBackup,
  backupsHaveActiveWork,
} from '@/features/admin/hooks/use-admin-users';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';
import { toast } from 'sonner';

jest.mock('@/features/admin/services/admin-service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Suprimir errores de navegación en jsdom
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (args[0]?.message?.includes('Not implemented: navigation')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

const mockMetrics = {
  systemMetrics: {
    totalEndpoints: 12,
    globalRequestCount: 1250,
    globalSuccessRate: 98.4,
    globalAvgResponseTime: 125.5,
    uptime: 3600000,
    startTime: '2025-11-28T09:00:00.000Z',
  },
  endpointMetrics: [],
  cacheMetrics: null,
};

const mockHealth = {
  overall: 'healthy',
  services: { api: 'healthy', cache: 'healthy', metrics: 'healthy' },
  uptime: 3600000,
  timestamp: '2025-11-28T10:00:00.000Z',
};

const mockPerformance = {
  slowestEndpoints: [],
  errorProneEndpoints: [],
  errorRateStats: [],
  timestamp: '2025-11-28T10:00:00.000Z',
};

const mockAlerts = {
  activeAlerts: [
    {
      type: 'error_rate',
      severity: 'medium',
      message: 'Error rate is high: 12.0%',
      value: 0.12,
      threshold: 0.1,
      timestamp: '2025-11-28T10:00:00.000Z',
    },
  ],
  alertCount: 1,
  timestamp: '2025-11-28T10:00:00.000Z',
};

describe('useAdminUsers hooks (CRÍTICO - 100% coverage)', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useSystemMetrics', () => {
    it('debe obtener métricas del sistema', async () => {
      (adminService.getSystemMetrics as jest.Mock).mockResolvedValue(mockMetrics);

      const { result } = renderHook(() => useSystemMetrics(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockMetrics);
      expect(adminService.getSystemMetrics).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error al obtener métricas', async () => {
      (adminService.getSystemMetrics as jest.Mock).mockRejectedValue(new Error('Error del servidor'));

      const { result } = renderHook(() => useSystemMetrics(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useHealthStatus', () => {
    it('debe obtener estado de salud del sistema', async () => {
      (adminService.getHealthStatus as jest.Mock).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useHealthStatus(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHealth);
    });

    it('debe detectar sistema no saludable', async () => {
      const unhealthy = {
        ...mockHealth,
        overall: 'unhealthy',
        services: { api: 'unhealthy', cache: 'healthy', metrics: 'healthy' },
      };

      (adminService.getHealthStatus as jest.Mock).mockResolvedValue(unhealthy);

      const { result } = renderHook(() => useHealthStatus(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.overall).toBe('unhealthy');
    });
  });

  describe('usePerformanceMetrics', () => {
    it('debe obtener métricas de rendimiento', async () => {
      (adminService.getPerformanceMetrics as jest.Mock).mockResolvedValue(mockPerformance);

      const { result } = renderHook(() => usePerformanceMetrics(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPerformance);
    });

    it('debe manejar error al obtener rendimiento', async () => {
      (adminService.getPerformanceMetrics as jest.Mock).mockRejectedValue(
        new Error('Error del servidor')
      );

      const { result } = renderHook(() => usePerformanceMetrics(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useDashboardAlerts', () => {
    it('debe obtener alertas activas del sistema', async () => {
      (adminService.getAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      const { result } = renderHook(() => useDashboardAlerts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAlerts);
      expect(adminService.getAlerts).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error al obtener alertas', async () => {
      (adminService.getAlerts as jest.Mock).mockRejectedValue(new Error('Error del servidor'));

      const { result } = renderHook(() => useDashboardAlerts(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAIUsage', () => {
    it('debe obtener el uso real de IA', async () => {
      const mockUsage = {
        provider: 'freellmapi',
        model: 'qwen3.8-27b',
        today: {
          total: 12,
          byOperation: {
            'category-suggestions': 10,
            'bulk-categorize': 1,
            'config-test': 1,
          },
          success: 11,
          failed: 1,
          avgLatencyMs: 225,
          cached: 4,
          cachedPercentage: 33.3,
        },
        last7Days: [],
        hasData: true,
      };

      (adminService.getAIUsage as jest.Mock).mockResolvedValue(mockUsage);

      const { result } = renderHook(() => useAIUsage(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUsage);
      expect(adminService.getAIUsage).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error al obtener el uso de IA', async () => {
      (adminService.getAIUsage as jest.Mock).mockRejectedValue(
        new Error('Error del servidor')
      );

      const { result } = renderHook(() => useAIUsage(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAIHealth', () => {
    it('debe obtener la salud de IA', async () => {
      const mockHealth = {
        status: 'healthy',
        provider: 'freellmapi',
        model: 'qwen3.8-27b',
        latencyMs: 225,
        checkedAt: '2025-11-28T10:00:00.000Z',
        cached: false,
      };

      (adminService.getAIHealth as jest.Mock).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useAIHealth(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHealth);
    });

    it('debe manejar error al obtener la salud de IA', async () => {
      (adminService.getAIHealth as jest.Mock).mockRejectedValue(
        new Error('Error del servidor')
      );

      const { result } = renderHook(() => useAIHealth(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useAdminUsers', () => {
    it('debe obtener lista de usuarios', async () => {
      const mockUsers = {
        usuarios: [
          { id: 'user-1', nombre: 'Juan', email: 'juan@example.com', activo: true },
          { id: 'user-2', nombre: 'María', email: 'maria@example.com', activo: true },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (adminService.getAdminUsers as jest.Mock).mockResolvedValue(mockUsers);

      const { result } = renderHook(() => useAdminUsers(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUsers);
      expect(adminService.getAdminUsers).toHaveBeenCalledWith(undefined, 1, 20);
    });

    it('debe buscar usuarios por query', async () => {
      const mockUsers = {
        usuarios: [{ id: 'user-1', nombre: 'Juan', email: 'juan@example.com', activo: true }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (adminService.getAdminUsers as jest.Mock).mockResolvedValue(mockUsers);

      const { result } = renderHook(() => useAdminUsers('juan', 1, 20), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.getAdminUsers).toHaveBeenCalledWith('juan', 1, 20);
    });

    it('debe paginar usuarios correctamente', async () => {
      const mockUsers = {
        usuarios: [],
        total: 50,
        page: 3,
        limit: 10,
        totalPages: 5,
      };

      (adminService.getAdminUsers as jest.Mock).mockResolvedValue(mockUsers);

      const { result } = renderHook(() => useAdminUsers(undefined, 3, 10), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.getAdminUsers).toHaveBeenCalledWith(undefined, 3, 10);
    });
  });

  describe('useUpdateUserStatus', () => {
    it('debe activar usuario correctamente', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (adminService.updateUserStatus as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useUpdateUserStatus(), { wrapper });

      result.current.mutate({ userId: 'user-1', activo: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.updateUserStatus).toHaveBeenCalledWith('user-1', true);
      expect(toast.success).toHaveBeenCalledWith('Usuario activado correctamente');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'users'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'metrics'] });
    });

    it('debe desactivar usuario correctamente', async () => {
      (adminService.updateUserStatus as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useUpdateUserStatus(), { wrapper });

      result.current.mutate({ userId: 'user-2', activo: false });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Usuario desactivado correctamente');
    });

    it('debe manejar error al actualizar estado', async () => {
      (adminService.updateUserStatus as jest.Mock).mockRejectedValue(
        new Error('No autorizado')
      );

      const { result } = renderHook(() => useUpdateUserStatus(), { wrapper });

      result.current.mutate({ userId: 'user-1', activo: true });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al actualizar estado: No autorizado');
    });
  });

  describe('useImpersonateUser', () => {
    it('debe impersonar usuario correctamente', async () => {
      const mockResponse = {
        impersonationToken: 'impersonation-token-123',
        impersonatedUser: { id: 'user-1', email: 'juan@example.com', nombre: 'Juan Pérez' },
        adminUser: { id: 'admin-1', email: 'admin@example.com', nombre: 'Admin' },
        expiresAt: '2025-11-28T11:00:00.000Z',
        startedAt: '2025-11-28T10:00:00.000Z',
      };

      (adminService.impersonateUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useImpersonateUser(), { wrapper });

      result.current.mutate('user-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.impersonateUser).toHaveBeenCalledWith('user-1');
      expect(toast.success).toHaveBeenCalledWith('Impersonando a Juan Pérez');
      expect(localStorage.getItem('impersonation_token')).toBe('impersonation-token-123');
      expect(localStorage.getItem('original_user_id')).toBe('admin-1');
      // Note: window.location.href cambio no se puede verificar en jsdom
    });

    it('debe manejar error al impersonar', async () => {
      (adminService.impersonateUser as jest.Mock).mockRejectedValue(
        new Error('No puedes impersonar a otro admin')
      );

      const { result } = renderHook(() => useImpersonateUser(), { wrapper });

      result.current.mutate('admin-2');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith(
        'Error al impersonar usuario: No puedes impersonar a otro admin'
      );
    });
  });

  describe('useEndImpersonation', () => {
    it('debe finalizar impersonación correctamente', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const mockResponse = {
        success: true,
        message: 'Impersonación finalizada',
        terminatedSession: {
          sessionId: 'session-1',
          adminId: 'admin-1',
          targetUserId: 'user-1',
          startedAt: '2025-11-28T10:00:00.000Z',
          endedAt: '2025-11-28T10:15:00.000Z',
          duration: '15m',
        },
        adminToken: 'original-token',
      };

      localStorage.setItem('impersonation_token', 'imp-token');
      localStorage.setItem('original_user_id', 'admin-1');

      (adminService.endImpersonation as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useEndImpersonation(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Impersonación finalizada');
      expect(localStorage.getItem('impersonation_token')).toBeNull();
      expect(localStorage.getItem('original_user_id')).toBeNull();
      expect(invalidateSpy).toHaveBeenCalled();
      // Note: window.location.href cambio no se puede verificar en jsdom
    });

    it('debe manejar error al finalizar impersonación', async () => {
      (adminService.endImpersonation as jest.Mock).mockRejectedValue(
        new Error('No hay impersonación activa')
      );

      const { result } = renderHook(() => useEndImpersonation(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('useAuditLogs', () => {
    it('debe obtener el historial global de auditoría', async () => {
      const mockHistory = {
        entries: [
          {
            id: 'e1',
            entityType: 'Producto',
            entityId: 'p1',
            changeType: 'UPDATE',
            changedByUserId: 'user-1',
            timestamp: '2025-11-26T15:27:21.148Z',
          },
          {
            id: 'e2',
            entityType: 'Lista',
            entityId: 'l1',
            changeType: 'CREATE',
            changedByUserId: 'user-2',
            timestamp: '2025-11-26T14:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      (adminService.getAuditLogs as jest.Mock).mockResolvedValue(mockHistory);

      const { result } = renderHook(() => useAuditLogs(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHistory);
      expect(adminService.getAuditLogs).toHaveBeenCalledWith(undefined, 1, 20);
    });

    it('debe filtrar por tipo de entidad y de cambio', async () => {
      const mockHistory = {
        entries: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      (adminService.getAuditLogs as jest.Mock).mockResolvedValue(mockHistory);

      const { result } = renderHook(
        () => useAuditLogs({ entityType: 'Producto', changeType: 'UPDATE' }, 1, 10),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.getAuditLogs).toHaveBeenCalledWith(
        { entityType: 'Producto', changeType: 'UPDATE' },
        1,
        10
      );
    });
  });

  describe('useSecurityAlerts', () => {
    it('debe obtener alertas de seguridad', async () => {
      const mockAlerts = {
        alerts: [
          {
            id: 'brute-force:victima@ejemplo.com',
            type: 'BRUTE_FORCE_EMAIL',
            severity: 'high',
            message: '6 intentos fallidos en 1 hora',
            createdAt: '2025-11-28T10:00:00.000Z',
            relatedEmail: 'victima@ejemplo.com',
          },
          {
            id: 'admin-without-2fa:admin-id',
            type: 'ADMIN_WITHOUT_2FA',
            severity: 'medium',
            message: 'El administrador no tiene 2FA activado',
            createdAt: '2025-11-28T10:00:00.000Z',
            relatedEmail: 'admin@ejemplo.com',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      (adminService.getSecurityAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      const { result } = renderHook(() => useSecurityAlerts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAlerts);
    });

    it('debe paginar alertas correctamente', async () => {
      const mockAlerts = {
        alerts: [],
        total: 0,
        page: 2,
        pageSize: 10,
        totalPages: 1,
      };

      (adminService.getSecurityAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      const { result } = renderHook(() => useSecurityAlerts(2, 10), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.getSecurityAlerts).toHaveBeenCalledWith(2, 10);
    });
  });

  describe('useSecurityOverview', () => {
    it('debe obtener el resumen de seguridad', async () => {
      const mockOverview = {
        twoFactor: { enabled: 1, total: 3 },
        failedLoginsLast24h: 4,
        turnstile: { enabled: true },
        gracePeriod: { count: 0, accounts: [] },
        unavailable: {},
      };

      (adminService.getSecurityOverview as jest.Mock).mockResolvedValue(mockOverview);

      const { result } = renderHook(() => useSecurityOverview(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOverview);
      expect(adminService.getSecurityOverview).toHaveBeenCalled();
    });
  });

  describe('useLoginAttempts', () => {
    it('debe obtener los intentos con filtros y paginación', async () => {
      const mockAttempts = {
        attempts: [
          {
            id: 'att-1',
            email: 'ana@ejemplo.com',
            success: true,
            reason: null,
            ipAddress: '1.2.3.4',
            userAgent: 'Mozilla/5.0',
            createdAt: '2025-11-28T10:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      (adminService.getLoginAttempts as jest.Mock).mockResolvedValue(mockAttempts);

      const { result } = renderHook(
        () => useLoginAttempts({ email: 'ana@ejemplo.com', success: true }, 1, 20),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAttempts);
      expect(adminService.getLoginAttempts).toHaveBeenCalledWith(
        { email: 'ana@ejemplo.com', success: true },
        1,
        20
      );
    });
  });

  describe('backupsHaveActiveWork', () => {
    it('detecta trabajo en curso con PENDING o RESTORING', () => {
      expect(backupsHaveActiveWork([{ status: 'PENDING' }])).toBe(true);
      expect(backupsHaveActiveWork([{ status: 'RESTORING' }])).toBe(true);
      expect(
        backupsHaveActiveWork([{ status: 'CREATED' }, { status: 'PENDING' }])
      ).toBe(true);
    });

    it('no hay trabajo en curso con estados finales', () => {
      expect(backupsHaveActiveWork([])).toBe(false);
      expect(
        backupsHaveActiveWork([
          { status: 'CREATED' },
          { status: 'FAILED' },
          { status: 'RESTORED' },
          { status: 'RESTORE_FAILED' },
        ])
      ).toBe(false);
    });
  });

  describe('useBackups', () => {
    const mockBackups = {
      backups: [
        {
          id: 'bk-1',
          filename: 'backup-2026-11-28-040000.sql.gz',
          sizeBytes: 4404019,
          status: 'CREATED',
          source: 'SCHEDULED',
          createdAt: '2026-11-28T04:00:00.000Z',
          createdByUserId: null,
          restoreReason: null,
          restoredAt: null,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };

    it('debe obtener el historial de copias con paginación', async () => {
      (adminService.getBackups as jest.Mock).mockResolvedValue(mockBackups);

      const { result } = renderHook(() => useBackups(1, 10), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockBackups);
      expect(adminService.getBackups).toHaveBeenCalledWith(1, 10);
    });

    it('debe manejar error al obtener las copias', async () => {
      (adminService.getBackups as jest.Mock).mockRejectedValue(
        new Error('No autorizado')
      );

      const { result } = renderHook(() => useBackups(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useCreateBackup', () => {
    it('debe crear la copia, avisar y refrescar la lista', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const mockCreated = {
        backup: {
          id: 'bk-3',
          filename: 'backup-2026-11-28-114500.sql.gz',
          sizeBytes: null,
          status: 'PENDING',
          source: 'MANUAL',
          createdAt: '2026-11-28T11:45:00.000Z',
          createdByUserId: 'admin-1',
          restoreReason: null,
          restoredAt: null,
        },
      };
      (adminService.createBackup as jest.Mock).mockResolvedValue(mockCreated);

      const { result } = renderHook(() => useCreateBackup(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.createBackup).toHaveBeenCalledWith();
      expect(toast.success).toHaveBeenCalledWith(
        'Copia solicitada: se está creando, actualiza en unos minutos'
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'backups'] });
    });

    it('debe mostrar el mensaje del backend en el 409', async () => {
      const conflict = {
        response: { data: { message: 'Ya hay una copia de seguridad en curso' } },
        message: 'Request failed with status code 409',
      };
      (adminService.createBackup as jest.Mock).mockRejectedValue(conflict);

      const { result } = renderHook(() => useCreateBackup(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith(
        'Error al crear la copia: Ya hay una copia de seguridad en curso'
      );
    });

    it('debe mostrar el mensaje genérico si el error no trae mensaje del backend', async () => {
      (adminService.createBackup as jest.Mock).mockRejectedValue(
        new Error('Error de red')
      );

      const { result } = renderHook(() => useCreateBackup(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al crear la copia: Error de red');
    });
  });

  describe('useDownloadBackup', () => {
    it('debe descargar el Blob de la copia', async () => {
      const blob = new Blob(['contenido'], { type: 'application/gzip' });
      (adminService.downloadBackup as jest.Mock).mockResolvedValue(blob);

      const { result } = renderHook(() => useDownloadBackup(), { wrapper });

      result.current.mutate({ id: 'bk-1', filename: 'backup.sql.gz' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.downloadBackup).toHaveBeenCalledWith('bk-1');
      expect(result.current.data).toBe(blob);
    });

    it('debe mostrar el mensaje del backend si la descarga falla', async () => {
      const notFound = {
        response: { data: { message: 'Copia no encontrada' } },
        message: 'Request failed with status code 404',
      };
      (adminService.downloadBackup as jest.Mock).mockRejectedValue(notFound);

      const { result } = renderHook(() => useDownloadBackup(), { wrapper });

      result.current.mutate({ id: 'bk-9', filename: 'backup.sql.gz' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith(
        'Error al descargar la copia: Copia no encontrada'
      );
    });
  });

  describe('useRestoreBackup', () => {
    it('debe restaurar con RESTAURAR y motivo, avisar y refrescar la lista', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const mockRestoring = {
        backup: {
          id: 'bk-1',
          filename: 'backup-2026-11-28-040000.sql.gz',
          sizeBytes: 4404019,
          status: 'RESTORING',
          source: 'SCHEDULED',
          createdAt: '2026-11-28T04:00:00.000Z',
          createdByUserId: null,
          restoreReason: 'Datos corruptos',
          restoredAt: null,
        },
      };
      (adminService.restoreBackup as jest.Mock).mockResolvedValue(mockRestoring);

      const { result } = renderHook(() => useRestoreBackup(), { wrapper });

      result.current.mutate({ id: 'bk-1', motivo: 'Datos corruptos' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.restoreBackup).toHaveBeenCalledWith('bk-1', {
        confirmacion: 'RESTAURAR',
        motivo: 'Datos corruptos',
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Restauración iniciada: la copia se está restaurando'
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin', 'backups'] });
    });

    it('debe mostrar el mensaje del backend si la restauración falla', async () => {
      const badRequest = {
        response: { data: { message: 'La confirmación debe ser exactamente RESTAURAR' } },
        message: 'Request failed with status code 400',
      };
      (adminService.restoreBackup as jest.Mock).mockRejectedValue(badRequest);

      const { result } = renderHook(() => useRestoreBackup(), { wrapper });

      result.current.mutate({ id: 'bk-1', motivo: 'Datos corruptos' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith(
        'Error al restaurar la copia: La confirmación debe ser exactamente RESTAURAR'
      );
    });
  });
});
