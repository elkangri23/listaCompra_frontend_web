/**
 * Tests CRÍTICOS (100% coverage) - admin-service.ts
 * Servicios de administración del sistema
 * 
 * Patrón: Arrange-Act-Assert
 * Mock: axios-instance
 * Funciones: Métricas, gestión de usuarios, auditoría, impersonación
 */

import {
  getSystemMetrics,
  getHealthStatus,
  getPerformanceMetrics,
  getAdminUsers,
  updateUserStatus,
  impersonateUser,
  endImpersonation,
  getAuditLogs,
  getSecurityAlerts,
} from '@/features/admin/services/admin-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { createMockAxiosResponse, createMockAxiosError } from '../../utils/test-utils';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('adminService (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSystemMetrics', () => {
    it('debe obtener métricas del sistema', async () => {
      const mockMetrics = {
        totalUsers: 1250,
        activeUsers: 890,
        totalLists: 4500,
        totalProducts: 18750,
        storageUsedMB: 342.5,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockMetrics)
      );

      const result = await getSystemMetrics();

      expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/metrics');
      expect(result.totalUsers).toBe(1250);
      expect(result.activeUsers).toBe(890);
    });

    it('debe manejar error al obtener métricas', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getSystemMetrics()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('getHealthStatus', () => {
    it('debe obtener estado de salud del sistema', async () => {
      const mockHealth = {
        status: 'healthy',
        database: 'connected',
        redis: 'connected',
        apiResponse: 45,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockHealth)
      );

      const result = await getHealthStatus();

      expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/health');
      expect(result.status).toBe('healthy');
      expect(result.database).toBe('connected');
    });

    it('debe detectar sistema no saludable', async () => {
      const mockHealth = {
        status: 'unhealthy',
        database: 'connected',
        redis: 'disconnected',
        apiResponse: 2500,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockHealth)
      );

      const result = await getHealthStatus();

      expect(result.status).toBe('unhealthy');
      expect(result.redis).toBe('disconnected');
    });
  });

  describe('getPerformanceMetrics', () => {
    it('debe obtener métricas de rendimiento', async () => {
      const mockPerformance = {
        avgResponseTime: 125,
        requestsPerMinute: 450,
        errorRate: 0.5,
        cpuUsage: 45.2,
        memoryUsage: 67.8,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockPerformance)
      );

      const result = await getPerformanceMetrics();

      expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/performance');
      expect(result.avgResponseTime).toBe(125);
      expect(result.errorRate).toBe(0.5);
    });

    it('debe manejar alto uso de recursos', async () => {
      const mockPerformance = {
        avgResponseTime: 850,
        requestsPerMinute: 1200,
        errorRate: 5.2,
        cpuUsage: 92.5,
        memoryUsage: 88.3,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockPerformance)
      );

      const result = await getPerformanceMetrics();

      expect(result.cpuUsage).toBeGreaterThan(90);
      expect(result.errorRate).toBeGreaterThan(5);
    });
  });

  describe('getAdminUsers', () => {
    it('debe obtener lista de usuarios con paginación', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            nombre: 'Juan Pérez',
            email: 'juan@example.com',
            rol: 'Usuario',
            activo: true,
          },
          {
            id: 'user-2',
            nombre: 'María García',
            email: 'maria@example.com',
            rol: 'Administrador',
            activo: true,
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockUsers)
      );

      const result = await getAdminUsers();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/users', {
        params: { q: undefined, page: 1, limit: 20 },
      });
      expect(result.items).toHaveLength(2);
    });

    it('debe buscar usuarios por query', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            nombre: 'Juan Pérez',
            email: 'juan@example.com',
            rol: 'Usuario',
            activo: true,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockUsers)
      );

      const result = await getAdminUsers('juan', 1, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/users', {
        params: { q: 'juan', page: 1, limit: 20 },
      });
      expect(result.items[0].nombre).toBe('Juan Pérez');
    });

    it('debe manejar permisos insuficientes', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('No autorizado', 403)
      );

      await expect(getAdminUsers()).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });

  describe('updateUserStatus', () => {
    it('debe activar un usuario', async () => {
      (axiosInstance.patch as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await updateUserStatus('user-1', true);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/admin/users/user-1/status',
        { activo: true }
      );
    });

    it('debe desactivar un usuario', async () => {
      (axiosInstance.patch as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await updateUserStatus('user-2', false);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/admin/users/user-2/status',
        { activo: false }
      );
    });

    it('debe manejar usuario no encontrado', async () => {
      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('Usuario no encontrado', 404)
      );

      await expect(updateUserStatus('invalid-id', true)).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe rechazar cambio a sí mismo', async () => {
      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('No puedes desactivarte a ti mismo', 400)
      );

      await expect(updateUserStatus('self-id', false)).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('impersonateUser', () => {
    it('debe impersonar a un usuario', async () => {
      const mockResponse = {
        success: true,
        token: 'impersonation-token',
        user: {
          id: 'user-1',
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await impersonateUser('user-1');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/admin/impersonate/user-1',
        {}
      );
      expect(result.token).toBe('impersonation-token');
      expect(result.user.id).toBe('user-1');
    });

    it('debe rechazar impersonación de admin', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('No puedes impersonar a otro administrador', 403)
      );

      await expect(impersonateUser('admin-id')).rejects.toMatchObject({
        response: { status: 403 },
      });
    });

    it('debe rechazar impersonación sin permisos', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('No autorizado', 403)
      );

      await expect(impersonateUser('user-1')).rejects.toMatchObject({
        response: { status: 403 },
      });
    });

    it('debe manejar usuario no encontrado', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Usuario no encontrado', 404)
      );

      await expect(impersonateUser('invalid-id')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('endImpersonation', () => {
    it('debe finalizar impersonación correctamente', async () => {
      const mockResponse = {
        success: true,
        message: 'Impersonación finalizada',
        token: 'original-admin-token',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockResponse)
      );

      const result = await endImpersonation();

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/admin/end-impersonation',
        {}
      );
      expect(result.success).toBe(true);
      expect(result.token).toBe('original-admin-token');
    });

    it('debe manejar finalización sin impersonación activa', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('No hay impersonación activa', 400)
      );

      await expect(endImpersonation()).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('getAuditLogs', () => {
    it('debe obtener logs de auditoría', async () => {
      const mockLogs = {
        items: [
          {
            id: 'log-1',
            action: 'delete',
            entity: 'list',
            entityId: 'list-1',
            userId: 'user-1',
            timestamp: new Date('2025-11-25'),
          },
          {
            id: 'log-2',
            action: 'share',
            entity: 'invitation',
            entityId: 'inv-1',
            userId: 'user-2',
            timestamp: new Date('2025-11-24'),
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockLogs)
      );

      const result = await getAuditLogs();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: { page: 1, limit: 20 },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items[0].action).toBe('delete');
    });

    it('debe filtrar logs por acción', async () => {
      const mockLogs = {
        items: [
          {
            id: 'log-1',
            action: 'delete',
            entity: 'list',
            entityId: 'list-1',
            userId: 'user-1',
            timestamp: new Date('2025-11-25'),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockLogs)
      );

      const result = await getAuditLogs({ action: 'delete' }, 1, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: { action: 'delete', page: 1, limit: 20 },
      });
      expect(result.items[0].action).toBe('delete');
    });

    it('debe filtrar logs por usuario y entidad', async () => {
      const filters = {
        userId: 'user-1',
        entity: 'list',
      };

      const mockLogs = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockLogs)
      );

      await getAuditLogs(filters, 1, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: { userId: 'user-1', entity: 'list', page: 1, limit: 20 },
      });
    });
  });

  describe('getSecurityAlerts', () => {
    it('debe obtener alertas de seguridad', async () => {
      const mockAlerts = {
        items: [
          {
            id: 'alert-1',
            type: 'suspicious_login',
            severity: 'high',
            userId: 'user-1',
            description: 'Intento de login desde ubicación inusual',
            timestamp: new Date('2025-11-25'),
          },
          {
            id: 'alert-2',
            type: 'rate_limit_exceeded',
            severity: 'medium',
            userId: 'user-2',
            description: 'Múltiples intentos fallidos',
            timestamp: new Date('2025-11-24'),
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockAlerts)
      );

      const result = await getSecurityAlerts();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/security/alerts', {
        params: { page: 1, limit: 20 },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items[0].severity).toBe('high');
    });

    it('debe paginar alertas correctamente', async () => {
      const mockAlerts = {
        items: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockAlerts)
      );

      await getSecurityAlerts(2, 10);

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/security/alerts', {
        params: { page: 2, limit: 10 },
      });
    });

    it('debe manejar error al obtener alertas', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getSecurityAlerts()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });
});
