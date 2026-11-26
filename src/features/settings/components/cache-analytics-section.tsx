import React from 'react';
import { useCacheAnalytics } from '../hooks/use-cache-analytics';

const CATEGORY_LABEL: Record<string, string> = {
  'ai-category': 'Categorías de IA',
  'ai-analysis': 'Análisis con IA',
  'user-data': 'Datos de usuario',
  other: 'Otras',
};

/**
 * Analítica de la caché de IA (Redis): aciertos, operaciones y ahorro de
 * llamadas a la API en los últimos 5 minutos. Solo tiene sentido con
 * tráfico: sin operaciones, todo llega a cero.
 */
export function CacheAnalyticsSection() {
  const { data, isLoading, isError } = useCacheAnalytics();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Cargando analítica de caché...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-gray-500">
        No se pudo cargar la analítica de caché ahora mismo.
      </p>
    );
  }

  const hitRatioPct = Math.round(data.hitRatio * 100);
  const categories = Object.entries(data.categoryStats).filter(
    ([, stats]) => stats.hits + stats.misses > 0,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-gray-500">Aciertos de caché</p>
          <p className="text-lg font-semibold text-gray-900">{hitRatioPct}%</p>
          <p className="text-xs text-gray-500">
            {data.hits} aciertos · {data.misses} fallos
          </p>
        </div>
        <div>
          <p className="text-gray-500">Operaciones</p>
          <p className="text-lg font-semibold text-gray-900">{data.totalOperations}</p>
          <p className="text-xs text-gray-500">
            {data.readsPerMinute.toFixed(1)} lecturas/min
          </p>
        </div>
        <div>
          <p className="text-gray-500">Llamadas a la API evitadas</p>
          <p className="text-lg font-semibold text-gray-900">{data.costSavings}</p>
          <p className="text-xs text-gray-500">Cada acierto evita una llamada</p>
        </div>
        <div>
          <p className="text-gray-500">Respuesta media</p>
          <p className="text-lg font-semibold text-gray-900">
            {Math.round(data.cacheResponseTime)} ms
          </p>
          <p className="text-xs text-gray-500">
            Sin caché: {Math.round(data.apiResponseTime)} ms
          </p>
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Por categoría</p>
          <ul className="space-y-1 text-sm">
            {categories.map(([category, stats]) => (
              <li key={category} className="flex items-center justify-between gap-4">
                <span className="text-gray-700">
                  {CATEGORY_LABEL[category] ?? category}
                </span>
                <span className="text-gray-500">
                  {Math.round(stats.hitRatio * 100)}% aciertos ({stats.hits}/
                  {stats.hits + stats.misses})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
