'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { GeneralLoading } from '@/components/layout';
import { usePurchaseHabits } from '../hooks/use-ai';
import { PurchaseHabitsTimeRange } from '../services/ai-service';

const TIME_RANGE_LABELS: Record<PurchaseHabitsTimeRange, string> = {
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
  '365d': 'Último año',
  all: 'Todo el historial',
};

const INSIGHT_TYPE_LABEL: Record<string, string> = {
  frequency: 'Frecuencia',
  seasonal: 'Estacional',
  preference: 'Preferencia',
  optimization: 'Optimización',
};

const INSIGHT_TYPE_BADGE: Record<string, string> = {
  frequency: 'bg-blue-100 text-blue-800',
  seasonal: 'bg-amber-100 text-amber-800',
  preference: 'bg-violet-100 text-violet-800',
  optimization: 'bg-green-100 text-green-800',
};

export const PurchaseHabitsSection: React.FC = () => {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState<PurchaseHabitsTimeRange>('90d');
  const [requested, setRequested] = useState(false);

  const userId = session?.user?.id || '';
  const { data, isLoading, isError, error } = usePurchaseHabits(userId, timeRange, requested);

  const insights = data?.insights || [];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">Tus hábitos de compra</h3>
          <p className="text-sm text-gray-500">
            La IA analiza tus compras y te cuenta qué patrones ve.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as PurchaseHabitsTimeRange)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
            aria-label="Periodo de análisis"
          >
            {(Object.keys(TIME_RANGE_LABELS) as PurchaseHabitsTimeRange[]).map((preset) => (
              <option key={preset} value={preset}>
                {TIME_RANGE_LABELS[preset]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setRequested(true)}
            disabled={isLoading || !userId}
            className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white disabled:opacity-50"
          >
            {isLoading ? 'Analizando…' : requested ? 'Volver a analizar' : 'Analizar mis hábitos'}
          </button>
        </div>
      </div>

      {!requested && (
        <p className="text-sm text-gray-500">
          Elige un periodo y pulsa «Analizar mis hábitos» para ver qué dice la IA de tus compras.
        </p>
      )}

      {requested && isLoading && <GeneralLoading />}

      {requested && !isLoading && isError && (
        <p className="text-sm text-red-500">
          No se pudo analizar tus hábitos ahora mismo. Inténtalo de nuevo más tarde.
          {error instanceof Error && error.message ? ` (${error.message})` : ''}
        </p>
      )}

      {requested && !isLoading && !isError && data && insights.length === 0 && (
        <p className="text-sm text-gray-500 py-4">
          Todavía no hay suficientes compras en este periodo para sacar conclusiones.
        </p>
      )}

      {requested && !isLoading && !isError && data && insights.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {data.metadata.productsAnalyzed} productos analizados en {data.metadata.listsAnalyzed}{' '}
            listas · {TIME_RANGE_LABELS[data.metadata.period.preset]}
          </p>
          <ul className="grid gap-3 md:grid-cols-2">
            {insights.map((insight, index) => (
              <li key={`${insight.type}-${index}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${INSIGHT_TYPE_BADGE[insight.type] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {INSIGHT_TYPE_LABEL[insight.type] || insight.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    Confianza: {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
