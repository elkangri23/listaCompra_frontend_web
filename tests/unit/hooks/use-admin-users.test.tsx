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
      const mockMetrics = {
        totalUsers: 1500,
        activeUsers: 1200,
        totalLists: 8500,
        totalProducts: 45000,
        storageUsedMB: 512,
      };

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
      const mockHealth = {
        status: 'healthy',
        database: 'connected',
        redis: 'connected',
        apiResponse: 85,
      };

      (adminService.getHealthStatus as jest.Mock).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useHealthStatus(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHealth);
    });

    it('debe detectar sistema no saludable', async () => {
      const mockHealth = {
        status: 'unhealthy',
        database: 'connected',
        redis: 'disconnected',
        apiResponse: 2500,
      };

      (adminService.getHealthStatus as jest.Mock).mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useHealthStatus(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('unhealthy');
    });
  });

  describe('usePerformanceMetrics', () => {
    it('debe obtener métricas de rendimiento', async () => {
      const mockPerformance = {
        avgResponseTime: 125,
        requestsPerMinute: 450,
        errorRate: 0.5,
        cpuUsage: 45,
        memoryUsage: 68,
      };

      (adminService.getPerformanceMetrics as jest.Mock).mockResolvedValue(mockPerformance);

      const { result } = renderHook(() => usePerformanceMetrics(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPerformance);
    });
  });

  describe('useAdminUsers', () => {
    it('debe obtener lista de usuarios', async () => {
      const mockUsers = {
        items: [
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
        items: [{ id: 'user-1', nombre: 'Juan', email: 'juan@example.com', activo: true }],
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
        items: [],
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
        token: 'impersonation-token-123',
        originalUserId: 'admin-1',
        impersonatedUserName: 'Juan Pérez',
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
        token: 'original-token',
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
