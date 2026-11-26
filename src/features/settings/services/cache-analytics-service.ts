import { axiosInstance } from '@/lib/api/axios-instance';

export interface CacheCategoryStats {
  hits: number;
  misses: number;
  hitRatio: number;
  avgTTL: number;
}

/**
 * Métricas de la caché de IA (Redis) del backend, ventana de 5 minutos
 * (GET /analytics/cache/realtime). El backend las calcula a partir de
 * las operaciones registradas en memoria; si no hay operaciones, los
 * contadores llegan a cero.
 */
export interface CacheAnalyticsDto {
  hits: number;
  misses: number;
  hitRatio: number;
  averageResponseTime: number;
  cacheResponseTime: number;
  apiResponseTime: number;
  totalOperations: number;
  readsPerMinute: number;
  writesPerMinute: number;
  costSavings: number;
  spaceSavings: number;
  categoryStats: Record<string, CacheCategoryStats>;
  timestamp: string;
  window: string;
}

const getCacheRealtime = async (): Promise<CacheAnalyticsDto> => {
  const response = await axiosInstance.get<{ success: boolean; data: CacheAnalyticsDto }>(
    '/analytics/cache/realtime',
  );
  return response.data.data;
};

export const cacheAnalyticsService = {
  getCacheRealtime,
};
