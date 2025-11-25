/**
 * DTOs para Administración
 * Tipos relacionados con funcionalidades de administración del sistema
 */

// ============================================================================
// Dashboard Metrics
// ============================================================================

export interface SystemMetricsDto {
  totalUsers: number;
  activeUsers: number;
  totalLists: number;
  activeLists: number;
  totalProducts: number;
  categorizedProducts: number;
  totalInvitations: number;
  pendingInvitations: number;
  totalBlueprints: number;
  publicBlueprints: number;
}

export interface UserActivityDto {
  userId: string;
  userName: string;
  userEmail: string;
  listsCount: number;
  productsCount: number;
  lastActivity: string;
}

export interface ListStatDto {
  listId: string;
  listName: string;
  owner: string;
  productsCount: number;
  collaboratorsCount: number;
  lastUpdate: string;
}

// ============================================================================
// User Management
// ============================================================================

export interface AdminUserDto {
  id: string;
  nombre: string;
  email: string;
  rol: 'USUARIO' | 'ADMIN';
  activo: boolean;
  emailVerificado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  // Estadísticas adicionales
  listasCreadas?: number;
  productosAgregados?: number;
  ultimaConexion?: string;
}

export interface PaginatedAdminUsersDto {
  usuarios: AdminUserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserStatusDto {
  activo: boolean;
}

export interface ImpersonateUserDto {
  userId: string;
}

export interface ImpersonateResponseDto {
  token: string;
  originalUserId: string;
  impersonatedUserId: string;
  impersonatedUserName: string;
  expiresAt: string;
}

export interface EndImpersonationDto {
  // Puede estar vacío o requerir confirmación
}

export interface EndImpersonationResponseDto {
  token: string;
  userId: string;
  message: string;
}

// ============================================================================
// Audit Logs
// ============================================================================

export interface AuditLogDto {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface PaginatedAuditLogsDto {
  logs: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLogFiltersDto {
  userId?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Security Alerts
// ============================================================================

export interface SecurityAlertDto {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  userName?: string;
  ipAddress: string;
  timestamp: string;
  resolved: boolean;
}

export interface PaginatedSecurityAlertsDto {
  alerts: SecurityAlertDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Performance Metrics
// ============================================================================

export interface PerformanceMetricsDto {
  apiResponseTime: number; // ms
  databaseQueryTime: number; // ms
  cacheHitRate: number; // percentage
  errorRate: number; // percentage
  requestsPerMinute: number;
  activeConnections: number;
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
}

// ============================================================================
// Health Status
// ============================================================================

export interface HealthStatusDto {
  status: 'healthy' | 'degraded' | 'down';
  database: 'up' | 'down';
  cache: 'up' | 'down';
  aiService: 'up' | 'down';
  message: string;
  timestamp: string;
}
