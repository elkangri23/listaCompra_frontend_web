'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SkeletonCard, SkeletonRow } from '@/components/ui/skeleton';
import {
  useBackups,
  useCreateBackup,
  useDownloadBackup,
  useRestoreBackup,
} from '@/features/admin/hooks/use-admin-users';
import type { BackupDto, BackupSource, BackupStatus } from '@/types/dtos/admin';

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 4,2 MB · 380 KB · 512 B; «—» mientras la copia aún se está creando. */
export function formatBackupSize(sizeBytes: number | null): string {
  if (sizeBytes === null || sizeBytes === undefined) return '—';
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024)
    return `${(sizeBytes / 1024).toLocaleString('es-ES', { maximumFractionDigits: 1 })} KB`;
  return `${(sizeBytes / (1024 * 1024)).toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB`;
}

const STATUS_LABEL: Record<BackupStatus, string> = {
  PENDING: 'Pendiente',
  CREATED: 'Creada',
  FAILED: 'Fallida',
  RESTORING: 'Restaurando',
  RESTORED: 'Restaurada',
  RESTORE_FAILED: 'Restauración fallida',
};

const STATUS_BADGE: Record<BackupStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  CREATED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  RESTORING: 'bg-blue-100 text-blue-800',
  RESTORED: 'bg-teal-100 text-teal-800',
  RESTORE_FAILED: 'bg-red-100 text-red-800',
};

const SOURCE_LABEL: Record<BackupSource, string> = {
  SCHEDULED: 'Programada',
  MANUAL: 'Manual',
};

/** Solo se puede descargar o restaurar una copia que existe y es válida. */
function isDownloadable(backup: BackupDto): boolean {
  return backup.status === 'CREATED' || backup.status === 'RESTORED';
}

/**
 * Contenido real de la pestaña Copias del panel de administración
 * (fase 6): última copia, historial con descarga y restauración, y botón
 * para crear una copia manual. Las copias se conservan 7 días.
 *
 * La restauración se ensaya primero en una base aislada y, durante la
 * restauración real, la app se detiene unos instantes: el diálogo lo
 * explica y exige escribir literalmente RESTAURAR más un motivo.
 */
export function AdminBackupsSection() {
  const [page, setPage] = useState(1);
  const [restoreTarget, setRestoreTarget] = useState<BackupDto | null>(null);
  const [confirmacion, setConfirmacion] = useState('');
  const [motivo, setMotivo] = useState('');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const backupsQuery = useBackups(page, 10);
  const createBackupMutation = useCreateBackup();
  const downloadBackupMutation = useDownloadBackup();
  const restoreBackupMutation = useRestoreBackup();

  const backups = backupsQuery.data?.backups || [];
  const totalPages = backupsQuery.data?.totalPages || 0;
  const total = backupsQuery.data?.total || 0;
  /** La lista viene ordenada por createdAt desc: la primera es la última. */
  const latest = backups.length > 0 ? backups[0] : null;
  const hasPending = backups.some((b) => b.status === 'PENDING');
  const hasRestoring = backups.some((b) => b.status === 'RESTORING');

  const handleCreate = () => {
    createBackupMutation.mutate();
  };

  const handleDownload = async (backup: BackupDto) => {
    setDownloadError(null);
    try {
      const blob = await downloadBackupMutation.mutateAsync({
        id: backup.id,
        filename: backup.filename,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : 'No se pudo descargar la copia. Inténtalo nuevamente.'
      );
    }
  };

  const openRestoreDialog = (backup: BackupDto) => {
    setRestoreTarget(backup);
    setConfirmacion('');
    setMotivo('');
  };

  const closeRestoreDialog = () => {
    setRestoreTarget(null);
    setConfirmacion('');
    setMotivo('');
  };

  /** La confirmación debe ser literal y el motivo no puede ir vacío. */
  const restoreFormValid =
    confirmacion === 'RESTAURAR' && motivo.trim().length > 0;

  const handleRestore = () => {
    if (!restoreTarget || !restoreFormValid) return;
    restoreBackupMutation.mutate(
      { id: restoreTarget.id, motivo: motivo.trim() },
      { onSuccess: () => closeRestoreDialog() }
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Copias de seguridad</h2>

      {/* Crear copia: siempre visible, también sin copias aún */}
      <div className="space-y-1">
        <button
          type="button"
          onClick={handleCreate}
          disabled={hasPending || createBackupMutation.isPending}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
        >
          Crear copia ahora
        </button>
        {hasPending && (
          <p className="text-sm text-muted-foreground">
            Copia solicitada: se está creando, actualiza en unos minutos
          </p>
        )}
        {hasRestoring && (
          <p className="text-sm text-muted-foreground">
            Hay una restauración en curso: la lista se actualiza sola
          </p>
        )}
      </div>

      {/* Última copia */}
      {backupsQuery.isLoading ? (
        <div role="status" aria-label="Cargando última copia…">
          <span className="sr-only">Cargando última copia…</span>
          <SkeletonCard />
        </div>
      ) : backupsQuery.isError || !backupsQuery.data ? (
        <p className="text-sm text-destructive">Error al cargar las copias de seguridad.</p>
      ) : !latest ? (
        <Card>
          <CardHeader>
            <CardTitle>Última copia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Sin copias aún</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Última copia{' '}
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[latest.status]}`}
              >
                {STATUS_LABEL[latest.status]}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <span className="text-muted-foreground">Fecha: </span>
              {formatDate(latest.createdAt)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Tamaño: </span>
              {formatBackupSize(latest.sizeBytes)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Origen: </span>
              {SOURCE_LABEL[latest.source]}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Archivo: </span>
              {latest.filename}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Conservación: </span>
              7 días
            </p>
            {latest.restoredAt && (
              <p className="text-sm">
                <span className="text-muted-foreground">Restaurada el: </span>
                {formatDate(latest.restoredAt)}
                {latest.restoreReason && ` · ${latest.restoreReason}`}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {isDownloadable(latest) && (
                <button
                  type="button"
                  onClick={() => handleDownload(latest)}
                  disabled={downloadBackupMutation.isPending}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Descargar
                </button>
              )}
              {isDownloadable(latest) && (
                <button
                  type="button"
                  onClick={() => openRestoreDialog(latest)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  Restaurar
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial */}
      <Card>
        <CardHeader>
          <CardTitle>Historial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {backupsQuery.isLoading ? (
            <div role="status" aria-label="Cargando historial de copias…">
              <span className="sr-only">Cargando historial de copias…</span>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : backupsQuery.isError || !backupsQuery.data ? (
            <p className="text-sm text-destructive">Error al cargar el historial de copias.</p>
          ) : backups.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Sin copias aún</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup: BackupDto) => (
                    <TableRow key={backup.id}>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(backup.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">{backup.filename}</TableCell>
                      <TableCell className="text-sm">
                        {formatBackupSize(backup.sizeBytes)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {SOURCE_LABEL[backup.source]}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[backup.status]}`}
                        >
                          {STATUS_LABEL[backup.status]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-wrap gap-2">
                          {isDownloadable(backup) && (
                            <button
                              type="button"
                              onClick={() => handleDownload(backup)}
                              disabled={downloadBackupMutation.isPending}
                              className="px-2 py-0.5 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                            >
                              Descargar
                            </button>
                          )}
                          {isDownloadable(backup) && (
                            <button
                              type="button"
                              onClick={() => openRestoreDialog(backup)}
                              className="px-2 py-0.5 border border-gray-300 rounded-md text-sm"
                            >
                              Restaurar
                            </button>
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? 'copia' : 'copias'} en total
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

      {downloadError && <p className="text-sm text-destructive">{downloadError}</p>}

      <p className="text-sm text-muted-foreground">
        Restaurar pide confirmación y deja constancia en auditoría. Las copias
        viven fuera del contenedor de la app y se conservan 7 días.
      </p>

      {/* Diálogo de restauración */}
      {restoreTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Restaurar la copia ${restoreTarget.filename}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg space-y-4">
            <h3 className="text-lg font-bold">Restaurar copia</h3>
            <p className="text-sm">
              Vas a restaurar la copia <strong>{restoreTarget.filename}</strong> del{' '}
              {formatDate(restoreTarget.createdAt)}. La base de datos volverá al
              estado de esa copia: todo lo creado después se perderá.
            </p>
            <p className="text-sm">
              Antes de restaurar, la copia se ensaya en una base aislada para
              comprobar que es válida. Durante la restauración la app se detiene
              unos instantes y nadie podrá usarla.
            </p>
            <div className="space-y-2">
              <label htmlFor="restore-confirmacion" className="block text-sm font-medium">
                Para confirmar, escribe RESTAURAR
              </label>
              <input
                id="restore-confirmacion"
                type="text"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                placeholder="RESTAURAR"
                autoComplete="off"
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
              />
              {confirmacion.length > 0 && confirmacion !== 'RESTAURAR' && (
                <p className="text-sm text-destructive">
                  La confirmación debe ser exactamente RESTAURAR
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="restore-motivo" className="block text-sm font-medium">
                Motivo de la restauración
              </label>
              <textarea
                id="restore-motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Por qué se restaura esta copia…"
                rows={3}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
              />
            </div>
            {restoreBackupMutation.isError && (
              <p className="text-sm text-destructive">
                Error al restaurar la copia. Inténtalo nuevamente.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRestoreDialog}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={!restoreFormValid || restoreBackupMutation.isPending}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Restaurar copia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
