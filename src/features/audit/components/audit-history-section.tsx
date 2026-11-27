'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useListAuditHistory, useListCollaborators } from '../hooks/use-audit-history';
import { AuditChangeType, AuditEntryDto } from '../types';
import { SkeletonRow } from '@/components/ui/skeleton'

const FIELD_LABELS: Record<string, string> = {
  nombre: 'nombre',
  descripcion: 'descripción',
  comprado: 'comprado',
  cantidad: 'cantidad',
  categoriaId: 'categoría',
  precio: 'precio',
  tiendaId: 'tienda',
  notas: 'notas',
  unidad: 'unidad',
  prioridad: 'prioridad',
  fechaCompra: 'fecha de compra',
};

// 'fechaCompra' acompaña siempre a 'comprado' y no aporta nada en el resumen.
const HIDDEN_FIELDS = new Set(['fechaCompra']);

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return 'vacío';
  if (typeof value === 'boolean') return value ? 'sí' : 'no';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function entityName(entry: AuditEntryDto): string {
  const snapshot = entry.changeType === 'DELETE' ? entry.oldValue : entry.newValue;
  if (entry.entityType === 'Lista') {
    return (snapshot?.['nombre'] as string) || 'la lista';
  }
  return (snapshot?.['nombre'] as string) || 'un producto';
}

function describe(entry: AuditEntryDto, actor: string): string {
  const isYou = actor === 'Tú';
  const verb = (you: string, other: string) => (isYou ? you : other);
  const name = entityName(entry);
  if (entry.entityType === 'Lista') {
    if (entry.changeType === 'DELETE') return `${actor} ${verb('eliminaste', 'eliminó')} la lista`;
    if (entry.changeType === 'CREATE') return `${actor} ${verb('creaste', 'creó')} la lista`;
    return `${actor} ${verb('actualizaste', 'actualizó')} la lista`;
  }
  // Producto
  if (entry.changeType === 'DELETE') return `${actor} ${verb('eliminaste', 'eliminó')} ${name}`;
  if (entry.changeType === 'CREATE') return `${actor} ${verb('añadiste', 'añadió')} ${name}`;
  if (entry.changedFields?.includes('comprado')) {
    return entry.newValue?.['comprado']
      ? `${actor} ${verb('marcaste', 'marcó')} como comprado ${name}`
      : `${actor} ${verb('desmarcaste', 'desmarcó')} ${name}`;
  }
  return `${actor} ${verb('actualizaste', 'actualizó')} ${name}`;
}

function changeSummary(entry: AuditEntryDto): string | null {
  const fields = (entry.changedFields || []).filter((f) => !HIDDEN_FIELDS.has(f));
  if (fields.length === 0) return null;
  return fields
    .map((field) => {
      const label = FIELD_LABELS[field] || field;
      const oldV = entry.oldValue?.[field];
      const newV = entry.newValue?.[field];
      if (oldV === undefined && newV === undefined) return label;
      return `${label}: ${formatValue(oldV)} → ${formatValue(newV)}`;
    })
    .join(' · ');
}

const CHANGE_BADGE: Record<AuditChangeType, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
};

const CHANGE_LABEL: Record<AuditChangeType, string> = {
  CREATE: 'Creado',
  UPDATE: 'Actualizado',
  DELETE: 'Eliminado',
};

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
    return <p className="text-red-500">Error al cargar el historial de cambios.</p>;
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
            const summary = changeSummary(entry);
            return (
              <li key={entry.id} className="flex gap-3 text-sm">
                <span
                  className={`shrink-0 self-start rounded-full px-2 py-0.5 text-xs font-medium ${CHANGE_BADGE[entry.changeType]}`}
                >
                  {CHANGE_LABEL[entry.changeType]}
                </span>
                <div className="min-w-0">
                  <p className="text-gray-900">{describe(entry, actorName(entry))}</p>
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
