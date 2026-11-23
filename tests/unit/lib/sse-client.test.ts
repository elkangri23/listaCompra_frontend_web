/**
 * Tests CRÍTICOS - sse-client.ts (CU-17)
 * Cliente SSE por fetch con parseo de bloques y reconexión.
 */

import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';
import { ReadableStream as NodeReadableStream } from 'stream/web';

// jsdom no expone TextEncoder/TextDecoder/ReadableStream a nivel global
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as unknown as { TextEncoder: unknown }).TextEncoder = NodeTextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  (globalThis as unknown as { TextDecoder: unknown }).TextDecoder = NodeTextDecoder;
}
if (typeof globalThis.ReadableStream === 'undefined') {
  (globalThis as unknown as { ReadableStream: unknown }).ReadableStream = NodeReadableStream;
}

import {
  parseSseBlock,
  parseListSyncEvent,
  createListEventStream,
} from '@/lib/api/sse-client';

const validEventData = JSON.stringify({
  listId: 'list-1',
  type: 'PRODUCT_ADDED',
  payload: { id: 'prod-1', nombre: 'Leche' },
  actorId: 'user-2',
  timestamp: '2025-11-28T10:00:00.000Z',
});

describe('parseSseBlock', () => {
  it('debe extraer event y data de un bloque completo', () => {
    const block = `event: PRODUCT_ADDED\ndata: ${validEventData}`;

    const result = parseSseBlock(block);

    expect(result).toEqual({ event: 'PRODUCT_ADDED', data: validEventData });
  });

  it('debe usar "message" por defecto sin línea event', () => {
    const result = parseSseBlock('data: {"type":"PING"}');

    expect(result).toEqual({ event: 'message', data: '{"type":"PING"}' });
  });

  it('debe acumular múltiples líneas data', () => {
    const result = parseSseBlock('data: linea1\ndata: linea2');

    expect(result?.data).toBe('linea1\nlinea2');
  });

  it('debe devolver null sin línea data', () => {
    expect(parseSseBlock('event: PING')).toBeNull();
  });

  it('debe ignorar comentarios y líneas vacías', () => {
    const result = parseSseBlock(': comentario\ndata: {"type":"PING"}');

    expect(result?.data).toBe('{"type":"PING"}');
  });
});

describe('parseListSyncEvent', () => {
  it('debe parsear un evento de sincronización válido', () => {
    const result = parseListSyncEvent(validEventData);

    expect(result).toEqual({
      listId: 'list-1',
      type: 'PRODUCT_ADDED',
      payload: { id: 'prod-1', nombre: 'Leche' },
      actorId: 'user-2',
      timestamp: '2025-11-28T10:00:00.000Z',
    });
  });

  it('debe devolver null para keep-alive sin listId', () => {
    expect(parseListSyncEvent('{"timestamp":"2025-11-28T10:00:00.000Z"}')).toBeNull();
  });

  it('debe devolver null para JSON inválido', () => {
    expect(parseListSyncEvent('no-es-json')).toBeNull();
  });
});

describe('createListEventStream', () => {
  let fetchMock: jest.Mock;
  let abortableBody: {
    controller: ReadableStreamDefaultController<Uint8Array>;
    stream: ReadableStream<Uint8Array>;
  };

  const encoder = new TextEncoder();

  const makeAbortableStream = () => {
    const controller = new AbortController();
    return { controller };
  };

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    abortableBody = {
      controller: undefined as never,
      stream: undefined as never,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /** Stream que nunca cierra: simula una conexión SSE estable */
  const makeOpenStream = () =>
    new NodeReadableStream<Uint8Array>({
      start() {
        // No encola ni cierra: reader.read() queda pendiente
      },
    });

  /** Stream con contenido fijo que cierra al terminar */
  const makeStream = (chunks: string[]) =>
    new NodeReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

  it('debe entregar los eventos parseados del stream', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      body: makeStream([`event: PRODUCT_ADDED\ndata: ${validEventData}\n\n`]),
    });

    const events: unknown[] = [];
    const cleanup = createListEventStream('list-1', 'token-123', {
      onEvent: (e) => events.push(e),
    });

    // Esperar a que el stream se procese (microtareas de la lectura)
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ type: 'PRODUCT_ADDED', actorId: 'user-2' });

    cleanup();
  });

  it('debe enviar el header Authorization con el token', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, body: makeOpenStream() });

    const cleanup = createListEventStream('list-1', 'token-123', { onEvent: jest.fn() });
    await jest.advanceTimersByTimeAsync(50);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/lists/list-1/stream'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
      })
    );

    cleanup();
  });

  it('debe reconectar con backoff tras un error de conexión', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network down'));
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      body: makeOpenStream(),
    });

    const errors: Error[] = [];
    const cleanup = createListEventStream('list-1', 'token-123', {
      onEvent: jest.fn(),
      onError: (e) => errors.push(e),
    });

    await jest.advanceTimersByTimeAsync(50);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(errors).toHaveLength(1);

    // Backoff inicial 1s: tras avanzar 1.5s hay segundo intento
    await jest.advanceTimersByTimeAsync(1500);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    cleanup();
  });

  it('debe dejar de reconectar tras cleanup', async () => {
    fetchMock.mockRejectedValue(new Error('Network down'));

    const cleanup = createListEventStream('list-1', 'token-123', {
      onEvent: jest.fn(),
    });

    await jest.advanceTimersByTimeAsync(50);
    cleanup();
    const calls = fetchMock.mock.calls.length;

    await jest.advanceTimersByTimeAsync(60000);
    expect(fetchMock.mock.calls.length).toBe(calls);
  });

  it('debe abortar al invocar cleanup (desmontaje limpio)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      body: makeOpenStream(),
    });

    const cleanup = createListEventStream('list-1', 'token-123', { onEvent: jest.fn() });
    await jest.advanceTimersByTimeAsync(50);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    cleanup();
    // No debe haber reconexión tras el cierre
    await jest.advanceTimersByTimeAsync(60000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('debe respetar una señal externa', async () => {
    const { controller: external } = makeAbortableStream();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      body: makeOpenStream(),
    });

    const cleanup = createListEventStream('list-1', 'token-123', {
      onEvent: jest.fn(),
      signal: external.signal,
    });

    await jest.advanceTimersByTimeAsync(50);
    external.abort();
    await jest.advanceTimersByTimeAsync(60000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    cleanup();
  });
});
