'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useListAuditHistory, useListCollaborators } from '../hooks/use-audit-history';
import { AuditChangeType, AuditEntryDto } from '../types';
import {
  auditChangeSummary,
  CHANGE_BADGE,
  CHANGE_LABEL,
  describeAuditEntry,
} from '../format-audit-entry';
import { SkeletonRow } from '@/components/ui/skeleton'

interface AuditHistorySectionProps {
  listId: string;
}

export const AuditHistorySection: React.FC<AuditHistorySectionProps> = ({ listId }) => {
  const [page, setPage] = useState(1);
  const [changeType, setChangeType] = useState<'ALL' | AuditChangeType>('ALL');
  const { data: session } = useSession();

  const filters = useMemo(
    () => ({
      page,
      pageSize: 10,
      ...(changeType !== 'ALL' ? { changeType } : {}),
    }),
    [page, changeType],
  );

  const { data, isLoading, error } = useListAuditHistory(listId, filters);
  const { data: collaborators } = useListCollaborators(listId);

  const nameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    (collaborators || []).forEach((c) => map.set(c.userId, c.userName));
    return map;
  }, [collaborators]);

  if (isLoading) {
    return (
      <div role="status" aria-label="Cargando historial de cambios…" className="space-y-2">
        <span className="sr-only">Cargando historial de cambios…</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600">Error al cargar el historial de cambios.</p>;
  }

  const entries = data?.entries || [];
  const totalPages = data?.totalPages || 0;

  const actorName = (entry: AuditEntryDto): string => {
    if (!entry.changedByUserId) return 'Alguien';
    if (session?.user?.id && entry.changedByUserId === session.user.id) return 'Tú';
    return nameByUserId.get(entry.changedByUserId) || 'Alguien';
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-base font-medium text-gray-900">Historial de cambios</h3>
        <select
          value={changeType}
          onChange={(e) => {
            setChangeType(e.target.value as 'ALL' | AuditChangeType);
            setPage(1);
          }}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
          aria-label="Filtrar por tipo de cambio"
        >
          <option value="ALL">Todos los cambios</option>
          <option value="UPDATE">Actualizaciones</option>
          <option value="DELETE">Eliminaciones</option>
        </select>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          Aún no hay cambios registrados en esta lista.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const summary = auditChangeSummary(entry);
            return (
              <li key={entry.id} className="flex gap-3 text-sm">
                <span
                  className={`shrink-0 self-start rounded-full px-2 py-0.5 text-xs font-medium ${CHANGE_BADGE[entry.changeType]}`}
                >
                  {CHANGE_LABEL[entry.changeType]}
                </span>
                <div className="min-w-0">
                  <p className="text-gray-900">{describeAuditEntry(entry, actorName(entry))}</p>
                  {summary && <p className="text-gray-500 break-words">{summary}</p>}
                  <p className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};
