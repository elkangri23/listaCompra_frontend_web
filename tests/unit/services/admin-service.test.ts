/**
 * Tests CRÍTICOS (100% coverage) - admin-service.ts
 * Servicios de administración del sistema
 *
 * Patrón: Arrange-Act-Assert
 * Mock: axios-instance
 * Funciones: Métricas, gestión de usuarios, auditoría, impersonación
 *
 * Los endpoints de dashboard responden `{status: 'success', data}` y los
 * de /admin/* `{success, data}`: el servicio desempaqueta el payload.
 */

import {
  getSystemMetrics,
  getHealthStatus,
  getPerformanceMetrics,
  getAlerts,
  getAIUsage,
  getAIHealth,
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
    delete: jest.fn(),
  },
}));

const mockHealthData = {
  overall: 'healthy',
  services: { api: 'healthy', cache: 'healthy', metrics: 'healthy' },
  uptime: 3600000,
  timestamp: '2025-11-28T10:00:00.000Z',
};

const mockMetricsData = {
  systemMetrics: {
    totalEndpoints: 12,
    globalRequestCount: 1250,
    globalSuccessRate: 98.4,
    globalAvgResponseTime: 125.5,
    uptime: 3600000,
    startTime: '2025-11-28T09:00:00.000Z',
  },
  endpointMetrics: [
    {
      path: '/api/v1/lists',
      method: 'GET',
      totalRequests: 500,
      successRequests: 490,
      errorRequests: 10,
      totalResponseTime: 50000,
      minResponseTime: 20,
      maxResponseTime: 800,
      avgResponseTime: 100,
      lastUpdated: '2025-11-28T10:00:00.000Z',
    },
  ],
  cacheMetrics: {
    hits: 800,
    misses: 200,
    hitRatio: 0.8,
    averageResponseTime: 45,
    cacheResponseTime: 12,
    apiResponseTime: 180,
    totalOperations: 1000,
    readsPerMinute: 50,
    writesPerMinute: 10,
    costSavings: 800,
    spaceSavings: 12.5,
    categoryStats: {},
  },
};

const mockPerformanceData = {
  slowestEndpoints: [
    {
      path: '/api/v1/ai/analyze',
      method: 'POST',
      totalRequests: 40,
      successRequests: 38,
      errorRequests: 2,
      totalResponseTime: 40000,
      minResponseTime: 500,
      maxResponseTime: 2500,
      avgResponseTime: 1000,
      lastUpdated: '2025-11-28T10:00:00.000Z',
    },
  ],
  errorProneEndpoints: [],
  errorRateStats: [
    { path: '/api/v1/lists', method: 'GET', errorRate: 2, totalErrors: 10 },
  ],
  timestamp: '2025-11-28T10:00:00.000Z',
};

const mockAlertsData = {
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

describe('adminService (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSystemMetrics', () => {
    it('debe obtener métricas del sistema desempaquetando {status, data}', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: mockMetricsData })
      );

      const result = await getSystemMetrics();

      expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/metrics');
      expect(result.systemMetrics.globalRequestCount).toBe(1250);
      expect(result.systemMetrics.globalSuccessRate).toBe(98.4);
      expect(result.endpointMetrics).toHaveLength(1);
      expect(result.cacheMetrics).toMatchObject({ hitRatio: 0.8 });
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
    it('debe obtener estado de salud del sistema desempaquetando {status, data}', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: mockHealthData })
      );

      const result = await getHealthStatus();

      expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/health');
      expect(result.overall).toBe('healthy');
      expect(result.services.api).toBe('healthy');
      expect(result.uptime).toBe(3600000);
    });

    it('debe detectar sistema degradado', async () => {
      const degraded = {
        ...mockHealthData,
        overall: 'degraded',
        services: { api: 'healthy', cache: 'degraded', metrics: 'healthy' },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: degraded })
      );

      const result = await getHealthStatus();

      expect(result.overall).toBe('degraded');
      expect(result.services.cache).toBe('degraded');
    });
  });

  describe('getPerformanceMetrics', () => {
    it('debe obtener métricas de rendimiento desempaquetando {status, data}', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: mockPerformanceData })
      );

      const result = await getPerformanceMetrics();

      expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/performance');
      expect(result.slowestEndpoints).toHaveLength(1);
      expect(result.slowestEndpoints[0].avgResponseTime).toBe(1000);
      expect(result.errorRateStats[0].errorRate).toBe(2);
    });

    it('debe manejar error al obtener rendimiento', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getPerformanceMetrics()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('getAlerts', () => {
    it('debe obtener alertas activas desempaquetando {status, data}', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ status: 'success', data: mockAlertsData })
      );

      const result = await getAlerts();

      expect(axiosInstance.get).toHaveBeenCalledWith('/dashboard/alerts');
      expect(result.alertCount).toBe(1);
      expect(result.activeAlerts[0].type).toBe('error_rate');
    });

    it('debe manejar error al obtener alertas', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getAlerts()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('getAIUsage', () => {
    it('debe obtener el uso real de IA desempaquetando {success, data}', async () => {
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
        last7Days: [
          {
            date: '2026-11-22',
            total: 3,
            success: 3,
            failed: 0,
            byOperation: {
              'category-suggestions': 3,
              'bulk-categorize': 0,
              'config-test': 0,
            },
          },
        ],
        hasData: true,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockUsage })
      );

      const result = await getAIUsage();

      expect(axiosInstance.get).toHaveBeenCalledWith('/ai/usage');
      expect(result.today.total).toBe(12);
      expect(result.today.byOperation['category-suggestions']).toBe(10);
      expect(result.last7Days).toHaveLength(1);
      expect(result.hasData).toBe(true);
    });

    it('debe manejar el caso sin datos (hasData false)', async () => {
      const mockUsage = {
        provider: 'freellmapi',
        model: 'qwen3.8-27b',
        today: {
          total: 0,
          byOperation: {
            'category-suggestions': 0,
            'bulk-categorize': 0,
            'config-test': 0,
          },
          success: 0,
          failed: 0,
          avgLatencyMs: null,
          cached: 0,
          cachedPercentage: null,
        },
        last7Days: [],
        hasData: false,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockUsage })
      );

      const result = await getAIUsage();

      expect(result.hasData).toBe(false);
      expect(result.today.avgLatencyMs).toBeNull();
      expect(result.today.cachedPercentage).toBeNull();
    });

    it('debe manejar error al obtener el uso de IA', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('No autorizado', 403)
      );

      await expect(getAIUsage()).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });

  describe('getAIHealth', () => {
    it('debe obtener la salud de IA desempaquetando {success, data}', async () => {
      const mockHealth = {
        status: 'healthy',
        provider: 'freellmapi',
        model: 'qwen3.8-27b',
        latencyMs: 225,
        checkedAt: '2025-11-28T10:00:00.000Z',
        cached: false,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockHealth })
      );

      const result = await getAIHealth();

      expect(axiosInstance.get).toHaveBeenCalledWith('/ai/health');
      expect(result.status).toBe('healthy');
      expect(result.latencyMs).toBe(225);
      expect(result.cached).toBe(false);
    });

    it('debe detectar salud degradada con motivo', async () => {
      const mockHealth = {
        status: 'degraded',
        provider: 'freellmapi',
        model: 'qwen3.8-27b',
        latencyMs: null,
        reason: 'Latencia alta',
        checkedAt: '2025-11-28T10:00:00.000Z',
        cached: true,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockHealth })
      );

      const result = await getAIHealth();

      expect(result.status).toBe('degraded');
      expect(result.reason).toBe('Latencia alta');
      expect(result.latencyMs).toBeNull();
    });

    it('debe manejar error al obtener la salud de IA', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getAIHealth()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('getAdminUsers', () => {
    it('debe obtener lista de usuarios con paginación desempaquetando {success, data}', async () => {
      const mockUsers = {
        usuarios: [
          {
            id: 'user-1',
            nombre: 'Juan Pérez',
            email: 'juan@example.com',
            rol: 'USUARIO',
            activo: true,
            emailVerificado: true,
            fechaCreacion: '2025-11-01T10:00:00.000Z',
            fechaActualizacion: '2025-11-20T10:00:00.000Z',
            listasCreadas: 3,
            productosAgregados: 12,
          },
          {
            id: 'user-2',
            nombre: 'María García',
            email: 'maria@example.com',
            rol: 'ADMIN',
            activo: true,
            emailVerificado: true,
            fechaCreacion: '2025-11-01T10:00:00.000Z',
            fechaActualizacion: '2025-11-20T10:00:00.000Z',
            listasCreadas: 1,
            productosAgregados: 4,
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockUsers })
      );

      const result = await getAdminUsers();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/users', {
        params: { q: undefined, page: 1, limit: 20 },
      });
      expect(result.usuarios).toHaveLength(2);
      expect(result.usuarios[0].nombre).toBe('Juan Pérez');
    });

    it('debe buscar usuarios por query', async () => {
      const mockUsers = {
        usuarios: [
          {
            id: 'user-1',
            nombre: 'Juan Pérez',
            email: 'juan@example.com',
            rol: 'USUARIO',
            activo: true,
            emailVerificado: true,
            fechaCreacion: '2025-11-01T10:00:00.000Z',
            fechaActualizacion: '2025-11-20T10:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockUsers })
      );

      const result = await getAdminUsers('juan', 1, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/users', {
        params: { q: 'juan', page: 1, limit: 20 },
      });
      expect(result.usuarios[0].nombre).toBe('Juan Pérez');
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
    it('debe impersonar a un usuario con POST /admin/impersonate {targetUserId}', async () => {
      const mockData = {
        impersonationToken: 'impersonation-token',
        impersonatedUser: {
          id: 'user-1',
          email: 'juan@example.com',
          nombre: 'Juan Pérez',
        },
        adminUser: { id: 'admin-1', email: 'admin@example.com', nombre: 'Admin' },
        expiresAt: '2025-11-28T11:00:00.000Z',
        startedAt: '2025-11-28T10:00:00.000Z',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({
          success: true,
          message: 'Impersonación iniciada exitosamente',
          data: mockData,
        })
      );

      const result = await impersonateUser('user-1');

      expect(axiosInstance.post).toHaveBeenCalledWith('/admin/impersonate', {
        targetUserId: 'user-1',
      });
      expect(result.impersonationToken).toBe('impersonation-token');
      expect(result.impersonatedUser.nombre).toBe('Juan Pérez');
      expect(result.adminUser.id).toBe('admin-1');
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
    it('debe finalizar impersonación correctamente con DELETE /admin/impersonate', async () => {
      const mockData = {
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
        adminToken: 'original-admin-token',
      };

      (axiosInstance.delete as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({
          success: true,
          message: 'Impersonación finalizada',
          data: mockData,
        })
      );

      const result = await endImpersonation();

      expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/impersonate', {
        data: {},
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Impersonación finalizada');
      expect(result.adminToken).toBe('original-admin-token');
      expect(result.terminatedSession.sessionId).toBe('session-1');
    });

    it('debe aceptar sessionId y reason opcionales', async () => {
      const mockData = {
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
        adminToken: 'original-admin-token',
      };

      (axiosInstance.delete as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockData })
      );

      await endImpersonation({ sessionId: 'session-1', reason: 'Revisión terminada' });

      expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/impersonate', {
        data: { sessionId: 'session-1', reason: 'Revisión terminada' },
      });
    });

    it('debe manejar finalización sin impersonación activa', async () => {
      (axiosInstance.delete as jest.Mock).mockRejectedValue(
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
