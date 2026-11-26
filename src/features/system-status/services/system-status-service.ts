import { axiosInstance } from '@/lib/api/axios-instance';
import type { SystemAlertsDto, SystemHealthDto } from '../types';

/**
 * Estado del servicio (GET /dashboard/health) y alertas activas
 * (GET /dashboard/alerts). Son métricas reales del backend: el estado se
 * calcula a partir de la tasa de éxito y la salud de la caché, y las
 * alertas saltan por tasa de errores, tiempo de respuesta o hit ratio
 * bajo. El resumen rápido (/dashboard/summary) NO se usa: devuelve datos
 * fijos (`requests: 0`).
 */
const getSystemHealth = async (): Promise<SystemHealthDto> => {
  const response = await axiosInstance.get<{ status: string; data: SystemHealthDto }>(
    '/dashboard/health',
  );
  return response.data.data;
};

const getSystemAlerts = async (): Promise<SystemAlertsDto> => {
  const response = await axiosInstance.get<{ status: string; data: SystemAlertsDto }>(
    '/dashboard/alerts',
  );
  return response.data.data;
};

export const systemStatusService = {
  getSystemHealth,
  getSystemAlerts,
};
