/**
 * Cliente SSE para sincronización en tiempo real de listas (CU-17)
 *
 * El backend expone GET /lists/:id/stream con Server-Sent Events, pero el
 * middleware de autenticación exige el header `Authorization: Bearer` y el
 * EventSource nativo no puede enviar headers. Por eso se implementa el
 * consumo con fetch + ReadableStream, con reconexión automática y backoff.
 */

import { API_BASE_URL } from '@/lib/api/api-url';

export interface ListSyncEvent {
  listId: string;
  type: string;
  payload: unknown;
  actorId?: string;
  timestamp?: string;
}

export interface ListEventStreamOptions {
  onEvent: (event: ListSyncEvent) => void;
  onError?: (error: Error) => void;
  /** Señal externa opcional para abortar además del control interno */
  signal?: AbortSignal;
}

const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const CONNECT_TIMEOUT_MS = 10000;

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

/**
 * Parsea un bloque SSE completo (líneas separadas por \n) y devuelve el evento
 * con su tipo y payload. `null` si el bloque no contiene datos.
 */
export function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = 'message';
  const dataLines: string[] = [];

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return { event, data: dataLines.join('\n') };
}

/**
 * Parsea el JSON de datos como ListSyncEvent. Devuelve null si no es válido
 * o si no tiene el tipo esperado (p.ej. keep-alive sin listId).
 */
export function parseListSyncEvent(rawData: string): ListSyncEvent | null {
  try {
    const parsed = JSON.parse(rawData) as Partial<ListSyncEvent> & {
      type?: string;
    };

    if (!parsed.type || !parsed.listId) {
      return null;
    }

    return parsed as ListSyncEvent;
  } catch {
    return null;
  }
}

/**
 * Abre el stream SSE de una lista con reconexión automática.
 * Devuelve una función de cleanup idempotente.
 *
 * La reconexión respeta el backoff exponencial entre intentos y se aborta
 * definitivamente cuando el controlador interno (o el externo) se aborta.
 */
export function createListEventStream(
  listId: string,
  token: string,
  options: ListEventStreamOptions
): () => void {
  const controller = new AbortController();
  const { onEvent, onError } = options;

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let stopped = false;
  let backoffMs = INITIAL_BACKOFF_MS;
  let activeAbort: AbortController | null = null;

  const run = async () => {
    while (!stopped) {
      activeAbort = new AbortController();

      // Un abort externo también cancela la conexión activa
      const abortListener = () => activeAbort?.abort();
      controller.signal.addEventListener('abort', abortListener, { once: true });

      try {
        const response = await fetch(
          `${API_BASE_URL}/lists/${encodeURIComponent(listId)}/stream`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'text/event-stream',
            },
            signal: activeAbort.signal,
          }
        );

        if (!response.ok || !response.body) {
          throw new Error(
            `SSE stream falló con status ${response.status}`
          );
        }

        // Conexión establecida: reiniciar backoff
        backoffMs = INITIAL_BACKOFF_MS;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Lectura del stream: acumular y procesar bloques separados por \n\n
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            // Cierre limpio: tratarlo como desconexión para reconectar con backoff
            throw new Error('Stream SSE cerrado por el servidor');
          }

          buffer += decoder.decode(value, { stream: true });

          let separatorIndex = buffer.indexOf('\n\n');
          while (separatorIndex !== -1) {
            const block = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);

            const parsed = parseSseBlock(block);
            if (parsed) {
              const syncEvent = parseListSyncEvent(parsed.data);
              if (syncEvent) {
                onEvent(syncEvent);
              }
            }
            separatorIndex = buffer.indexOf('\n\n');
          }
        }
      } catch (error) {
        if (controller.signal.aborted || stopped) {
          break;
        }

        onError?.(
          error instanceof Error ? error : new Error('Error desconocido en SSE')
        );

        // Reconexión con backoff exponencial (cap MAX_BACKOFF_MS)
        const waitMs = Math.min(backoffMs, MAX_BACKOFF_MS);
        backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);

        try {
          await delay(waitMs, controller.signal);
        } catch {
          break; // Abortado mientras esperaba reconexión
        }
      } finally {
        controller.signal.removeEventListener('abort', abortListener);
      }
    }
  };

  run().catch(() => {
    // Nunca debe propagar: la función run gestiona sus errores
  });

  return () => {
    stopped = true;
    controller.abort();
    activeAbort?.abort();
  };
}
