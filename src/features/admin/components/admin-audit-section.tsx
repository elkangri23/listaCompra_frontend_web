'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SkeletonRow } from '@/components/ui/skeleton';
import { useAdminUsers, useAuditLogs } from '@/features/admin/hooks/use-admin-users';
import type { AdminAuditFilters } from '@/features/admin/services/admin-service';
import type { AuditChangeType, AuditEntryDto } from '@/features/audit/types';
import {
  auditChangeSummary,
  CHANGE_BADGE,
  CHANGE_LABEL,
  describeAuditEntry,
} from '@/features/audit/format-audit-entry';

type EntityFilter = 'ALL' | 'Lista' | 'Producto';

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Contenido real de la pestaña Auditoría del panel de administración (fase 4):
 * vista global de audit_entries con filtros por tipo de entidad y de cambio,
 * entradas humanizadas (misma lógica que el historial por lista) y paginación.
 *
 * No hay filtro por usuario: en producción solo existen eventos de Lista y
 * Producto (sin eventos de Usuario), así que no habría nada que filtrar.
 * La columna «Quién» resuelve el nombre con la lista de usuarios del panel
 * (mismo endpoint que la pestaña Usuarios, sin endpoint nuevo) y «Tú» para
 * el usuario actual; si no se resuelve, muestra el id recortado.
 */
export function AdminAuditSection() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<EntityFilter>('ALL');
  const [changeType, setChangeType] = useState<'ALL' | AuditChangeType>('ALL');
  const { data: session } = useSession();

  const filters = useMemo<AdminAuditFilters>(
    () => ({
      ...(entityType !== 'ALL' ? { entityType } : {}),
      ...(changeType !== 'ALL' ? { changeType } : {}),
    }),
    [entityType, changeType]
  );

  const { data, isLoading, isError } = useAuditLogs(filters, page, 10);
  const { data: usersData } = useAdminUsers('', 1, 20);

  const nameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    (usersData?.usuarios || []).forEach((u) => map.set(u.id, u.nombre));
    return map;
  }, [usersData]);

  if (isLoading) {
    return (
      <div role="status" aria-label="Cargando auditoría…" className="space-y-2">
        <span className="sr-only">Cargando auditoría…</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Error al cargar la auditoría.</p>;
  }

  const entries = data.entries || [];
  const totalPages = data.totalPages || 0;

  const actorName = (entry: AuditEntryDto): string => {
    if (!entry.changedByUserId) return 'Alguien';
    if (session?.user?.id && entry.changedByUserId === session.user.id) return 'Tú';
    return (
      nameByUserId.get(entry.changedByUserId) ||
      `Usuario ${entry.changedByUserId.slice(0, 8)}`
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Auditoría</h2>
      <Card>
        <CardHeader>
          <CardTitle>Cambios en la aplicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as EntityFilter);
                setPage(1);
              }}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
              aria-label="Filtrar por tipo de entidad"
            >
              <option value="ALL">Todos</option>
              <option value="Lista">Listas</option>
              <option value="Producto">Productos</option>
            </select>
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
              <option value="CREATE">Creados</option>
              <option value="UPDATE">Actualizaciones</option>
              <option value="DELETE">Eliminaciones</option>
            </select>
          </div>

          {entries.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">
              No hay cambios con estos filtros.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cuándo</TableHead>
                    <TableHead>Quién</TableHead>
                    <TableHead>Qué</TableHead>
                    <TableHead>Detalle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const summary = auditChangeSummary(entry);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          {formatDate(entry.timestamp)}
                        </TableCell>
                        <TableCell className="text-sm">{actorName(entry)}</TableCell>
                        <TableCell>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${CHANGE_BADGE[entry.changeType]}`}
                          >
                            {CHANGE_LABEL[entry.changeType]}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <p className="text-gray-900">
                            {describeAuditEntry(entry, actorName(entry))}
                          </p>
                          {summary && (
                            <p className="text-gray-500 break-words">{summary}</p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground">
                {data.total} {data.total === 1 ? 'cambio' : 'cambios'} en total
              </p>
            </>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
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
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Solo se registran cambios de listas y productos; no hay eventos de usuario.
      </p>
    </div>
  );
}
