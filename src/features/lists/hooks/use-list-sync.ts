/**
 * Hook de sincronización en tiempo real de una lista (CU-17)
 *
 * Se suscribe al stream SSE del backend y refleja los cambios de otros
 * usuarios (colaboradores) en la caché de React Query: los productos
 * modificados recargan su query y los cambios de la lista recargan
 * el detalle y el listado. Los eventos propios (actorId === usuario
 * actual) se ignoran porque la UI local ya los ha aplicado.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { createListEventStream, ListSyncEvent } from '@/lib/api/sse-client';

const PRODUCT_EVENT_TYPES = new Set([
  'PRODUCT_ADDED',
  'PRODUCT_UPDATED',
  'PRODUCT_DELETED',
  'PRODUCT_MARKED',
]);

const LIST_EVENT_TYPES = new Set([
  'LIST_CREATED',
  'LIST_UPDATED',
  'LIST_DELETED',
  'LIST_RESTORED',
]);

export interface UseListSyncOptions {
  /** false desactiva la suscripción (p.ej. sin permisos o sin sesión) */
  enabled?: boolean;
}

export function useListSync(
  listId: string,
  options: UseListSyncOptions = {}
): void {
  const { enabled = true } = options;
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const token = session?.accessToken;
  const userId = session?.user?.id;

  // Guardamos los callbacks en refs para no reiniciar el stream
  // cuando el componente se re-renderiza.
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    // El stream mantiene la conexión abierta: se puede desactivar (p.ej. en E2E,
    // donde 'networkidle' de Playwright nunca se resolvería con un SSE activo)
    if (process.env.NEXT_PUBLIC_LIST_SYNC_DISABLED === '1') {
      return;
    }

    if (!enabled || !listId || status !== 'authenticated' || !token) {
      return;
    }

    const handleEvent = (event: ListSyncEvent) => {
      // Ignorar los eventos propios: la mutación local ya actualizó la caché
      if (event.actorId && event.actorId === userIdRef.current) {
        return;
      }

      if (PRODUCT_EVENT_TYPES.has(event.type)) {
        queryClient.invalidateQueries({
          queryKey: ['lists', listId, 'products'],
        });
      }

      if (PRODUCT_EVENT_TYPES.has(event.type) || LIST_EVENT_TYPES.has(event.type)) {
        queryClient.invalidateQueries({
          queryKey: ['lists', listId],
        });
        // Los cambios de una lista también afectan al listado general
        queryClient.invalidateQueries({ queryKey: ['lists'] });
      }
    };

    const cleanup = createListEventStream(listId, token, {
      onEvent: handleEvent,
      onError: () => {
        // Los errores de reconexión se gestionan dentro del cliente SSE
        // (backoff exponencial). No se notifican al usuario para evitar
        // toasts ruidosos en un entorno con reconexión automática.
      },
    });

    return cleanup;
  }, [enabled, listId, status, token, queryClient]);
}
