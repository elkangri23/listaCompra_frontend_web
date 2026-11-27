/**
 * DTOs del panel de estado del backend (GET /dashboard/health y
 * /dashboard/alerts). OJO: estos endpoints responden con la envoltura
 * `{status: 'success', data}` y no con `{success, data}` como el resto.
 */

export type SystemHealthLevel = 'healthy' | 'degraded' | 'unhealthy';

export interface SystemHealthDto {
  overall: SystemHealthLevel;
  services: {
    api: SystemHealthLevel;
    cache: SystemHealthLevel;
    metrics: SystemHealthLevel;
  };
  /** Milisegundos desde que arrancó la API (el backend devuelve Date.now() - startTime) */
  uptime: number;
  timestamp: string;
}

export interface SystemAlertDto {
  type: 'error_rate' | 'response_time' | 'cache_hit_ratio' | string;
  severity: 'high' | 'medium';
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

export interface SystemAlertsDto {
  activeAlerts: SystemAlertDto[];
  alertCount: number;
  timestamp: string;
}
