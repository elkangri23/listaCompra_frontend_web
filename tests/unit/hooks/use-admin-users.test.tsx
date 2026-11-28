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
    it('debe obtener logs de auditoría', async () => {
      const mockLogs = {
        items: [
          { id: 'log-1', action: 'delete', entity: 'list', userId: 'user-1' },
          { id: 'log-2', action: 'share', entity: 'invitation', userId: 'user-2' },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (adminService.getAuditLogs as jest.Mock).mockResolvedValue(mockLogs);

      const { result } = renderHook(() => useAuditLogs(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLogs);
      expect(adminService.getAuditLogs).toHaveBeenCalledWith(undefined, 1, 20);
    });

    it('debe filtrar logs por acción', async () => {
      const mockLogs = {
        items: [{ id: 'log-1', action: 'delete', entity: 'list', userId: 'user-1' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (adminService.getAuditLogs as jest.Mock).mockResolvedValue(mockLogs);

      const { result } = renderHook(
        () => useAuditLogs({ action: 'delete' }, 1, 20),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.getAuditLogs).toHaveBeenCalledWith({ action: 'delete' }, 1, 20);
    });
  });

  describe('useSecurityAlerts', () => {
    it('debe obtener alertas de seguridad', async () => {
      const mockAlerts = {
        items: [
          { id: 'alert-1', type: 'suspicious_login', severity: 'high' },
          { id: 'alert-2', type: 'rate_limit_exceeded', severity: 'medium' },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (adminService.getSecurityAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      const { result } = renderHook(() => useSecurityAlerts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAlerts);
    });

    it('debe paginar alertas correctamente', async () => {
      const mockAlerts = {
        items: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 1,
      };

      (adminService.getSecurityAlerts as jest.Mock).mockResolvedValue(mockAlerts);

      const { result } = renderHook(() => useSecurityAlerts(2, 10), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminService.getSecurityAlerts).toHaveBeenCalledWith(2, 10);
    });
  });
});
