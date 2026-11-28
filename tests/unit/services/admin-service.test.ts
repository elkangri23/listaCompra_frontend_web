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
  getSecurityOverview,
  getLoginAttempts,
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
    const mockHistory = {
      entries: [
        {
          id: 'e1',
          entityType: 'Producto',
          entityId: 'p1',
          changeType: 'UPDATE',
          changedByUserId: 'user-1',
          timestamp: '2025-11-26T15:27:21.148Z',
          changedFields: ['comprado'],
          oldValue: { comprado: false, nombre: 'Leche' },
          newValue: { comprado: true, nombre: 'Leche' },
        },
        {
          id: 'e2',
          entityType: 'Lista',
          entityId: 'l1',
          changeType: 'CREATE',
          changedByUserId: 'user-2',
          timestamp: '2025-11-26T14:00:00.000Z',
          changedFields: ['nombre'],
          newValue: { nombre: 'Compra semanal' },
        },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };

    it('debe obtener el historial global desempaquetando {success, data}', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockHistory })
      );

      const result = await getAuditLogs();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: { page: 1, pageSize: 20 },
      });
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].changeType).toBe('UPDATE');
      expect(result.total).toBe(2);
    });

    it('debe filtrar por tipo de entidad y de cambio', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockHistory })
      );

      const result = await getAuditLogs(
        { entityType: 'Producto', changeType: 'UPDATE' },
        1,
        10
      );

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: { entityType: 'Producto', changeType: 'UPDATE', page: 1, pageSize: 10 },
      });
      expect(result.entries).toHaveLength(2);
    });

    it('debe filtrar por usuario y fechas', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({
          success: true,
          data: { ...mockHistory, entries: [], total: 0, totalPages: 0 },
        })
      );

      await getAuditLogs(
        {
          changedByUserId: 'user-1',
          startDate: '2025-11-01',
          endDate: '2025-11-30',
        },
        2,
        10
      );

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/audit-logs', {
        params: {
          changedByUserId: 'user-1',
          startDate: '2025-11-01',
          endDate: '2025-11-30',
          page: 2,
          pageSize: 10,
        },
      });
    });
  });

  describe('getSecurityOverview', () => {
    const mockOverview = {
      twoFactor: { enabled: 1, total: 3 },
      failedLoginsLast24h: 4,
      turnstile: { enabled: true },
      gracePeriod: {
        count: 1,
        accounts: [
          {
            email: 'gracia@ejemplo.com',
            eliminacionSolicitadaEn: '2025-11-03T10:00:00.000Z',
            daysLeft: 5,
          },
        ],
      },
      unavailable: {},
    };

    it('debe obtener el resumen desempaquetando {success, data}', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockOverview })
      );

      const result = await getSecurityOverview();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/security/overview');
      expect(result.twoFactor).toEqual({ enabled: 1, total: 3 });
      expect(result.failedLoginsLast24h).toBe(4);
      expect(result.turnstile.enabled).toBe(true);
      expect(result.gracePeriod?.count).toBe(1);
    });

    it('debe manejar error al obtener el resumen', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getSecurityOverview()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('getLoginAttempts', () => {
    const mockAttempts = {
      attempts: [
        {
          id: 'att-1',
          email: 'ana@ejemplo.com',
          success: true,
          reason: null,
          ipAddress: '1.2.3.4',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
          createdAt: '2025-11-28T10:00:00.000Z',
        },
        {
          id: 'att-2',
          email: 'victima@ejemplo.com',
          success: false,
          reason: 'WRONG_PASSWORD',
          ipAddress: '9.9.9.9',
          userAgent: 'Mozilla/5.0 (iPhone)',
          createdAt: '2025-11-28T09:00:00.000Z',
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };

    it('debe obtener los intentos desempaquetando {success, data}', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockAttempts })
      );

      const result = await getLoginAttempts();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/security/login-attempts', {
        params: { page: 1, pageSize: 20 },
      });
      expect(result.attempts).toHaveLength(2);
      expect(result.attempts[0].success).toBe(true);
      expect(result.attempts[1].reason).toBe('WRONG_PASSWORD');
    });

    it('debe filtrar por email y resultado, y paginar', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockAttempts })
      );

      await getLoginAttempts({ email: 'victima@ejemplo.com', success: false }, 2, 10);

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/security/login-attempts', {
        params: { email: 'victima@ejemplo.com', success: false, page: 2, pageSize: 10 },
      });
    });

    it('debe manejar error al obtener los intentos', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(getLoginAttempts()).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('getSecurityAlerts', () => {
    it('debe obtener alertas de seguridad desempaquetando {success, data}', async () => {
      const mockAlerts = {
        alerts: [
          {
            id: 'brute-force:victima@ejemplo.com',
            type: 'BRUTE_FORCE_EMAIL',
            severity: 'high',
            message: '6 intentos fallidos en 1 hora para victima@ejemplo.com',
            createdAt: '2025-11-28T10:00:00.000Z',
            relatedEmail: 'victima@ejemplo.com',
          },
          {
            id: 'admin-without-2fa:admin-id',
            type: 'ADMIN_WITHOUT_2FA',
            severity: 'medium',
            message: 'El administrador admin@ejemplo.com no tiene 2FA activado',
            createdAt: '2025-11-28T10:00:00.000Z',
            relatedEmail: 'admin@ejemplo.com',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockAlerts })
      );

      const result = await getSecurityAlerts();

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/security/alerts', {
        params: { page: 1, pageSize: 20 },
      });
      expect(result.alerts).toHaveLength(2);
      expect(result.alerts[0].severity).toBe('high');
      expect(result.alerts[0].type).toBe('BRUTE_FORCE_EMAIL');
    });

    it('debe paginar alertas correctamente', async () => {
      const mockAlerts = {
        alerts: [],
        total: 0,
        page: 2,
        pageSize: 10,
        totalPages: 1,
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true, data: mockAlerts })
      );

      await getSecurityAlerts(2, 10);

      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/security/alerts', {
        params: { page: 2, pageSize: 10 },
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
