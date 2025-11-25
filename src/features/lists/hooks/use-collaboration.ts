import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseAutoRefreshOptions {
  queryKey: string[];
  interval?: number; // ms, default 10000 (10s)
  onRefresh?: () => void;
}

/**
 * Hook para auto-refresh de datos con polling
 * Útil para colaboración en tiempo real básica
 */
export function useAutoRefresh({
  queryKey,
  interval = 10000,
  onRefresh,
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient();

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
    onRefresh?.();
  }, [queryClient, queryKey, onRefresh]);

  useEffect(() => {
    const intervalId = setInterval(refresh, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [refresh, interval]);

  return { refresh };
}

interface UseConflictDetectionOptions {
  listId: string;
  lastModified: string;
  onConflict?: () => void;
}

/**
 * Hook para detectar conflictos en edición colaborativa
 * Compara el timestamp de última modificación
 */
export function useConflictDetection({
  listId,
  lastModified,
  onConflict,
}: UseConflictDetectionOptions) {
  const handleConflict = useCallback(() => {
    toast.warning('⚠️ Otro usuario ha modificado esta lista', {
      description: 'Los cambios se han actualizado automáticamente.',
      action: {
        label: 'Recargar',
        onClick: () => window.location.reload(),
      },
    });
    onConflict?.();
  }, [onConflict]);

  return { handleConflict };
}
