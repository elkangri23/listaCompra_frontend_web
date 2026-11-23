/**
 * Tests CRÍTICOS - use-list-sync.ts (CU-17)
 * El hook debe suscribirse al stream SSE e invalidar las queries
 * correspondientes al recibir eventos de otros usuarios, ignorando
 * los eventos propios.
 */

import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useSession } from 'next-auth/react'

import { useListSync } from '@/features/lists/hooks/use-list-sync'
import { createListEventStream, ListSyncEvent } from '@/lib/api/sse-client'
import { createTestQueryClient } from '../../utils/test-utils'

jest.mock('@/lib/api/sse-client', () => ({
  createListEventStream: jest.fn(),
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

const mockUseSession = useSession as jest.Mock
const mockCreateStream = createListEventStream as jest.Mock

const SESSION = {
  accessToken: 'token-123',
  user: { id: 'user-1', name: 'Usuario', email: 'u@example.com' },
}

describe('useListSync (CU-17)', () => {
  let queryClient: QueryClient
  let onEvent: (event: ListSyncEvent) => void
  let cleanupFn: jest.Mock

  const renderSync = (listId = 'list-1', enabled = true) =>
    renderHook(() => useListSync(listId, { enabled }), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

  beforeEach(() => {
    queryClient = createTestQueryClient()
    cleanupFn = jest.fn()
    mockCreateStream.mockImplementation(
      (_listId: string, _token: string, opts: { onEvent: typeof onEvent }) => {
        onEvent = opts.onEvent
        return cleanupFn
      },
    )
    mockUseSession.mockReturnValue({ data: SESSION, status: 'authenticated' })
    jest.spyOn(queryClient, 'invalidateQueries')
  })

  afterEach(() => {
    queryClient.clear()
    jest.clearAllMocks()
  })

  it('debe suscribirse al stream con el listId y token de sesión', () => {
    renderSync('list-1')

    expect(mockCreateStream).toHaveBeenCalledWith(
      'list-1',
      'token-123',
      expect.objectContaining({ onEvent: expect.any(Function) }),
    )
  })

  it('no debe suscribirse sin listId', () => {
    renderSync('')

    expect(mockCreateStream).not.toHaveBeenCalled()
  })

  it('no debe suscribirse con enabled=false', () => {
    renderSync('list-1', false)

    expect(mockCreateStream).not.toHaveBeenCalled()
  })

  it('no debe suscribirse sin sesión autenticada', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' })

    renderSync('list-1')

    expect(mockCreateStream).not.toHaveBeenCalled()
  })

  it('debe desmontar el stream al limpiar', () => {
    const { unmount } = renderSync('list-1')

    unmount()

    expect(cleanupFn).toHaveBeenCalled()
  })

  it('debe invalidar productos y listas ante un evento de otro usuario', async () => {
    renderSync('list-1')
    onEvent!({
      listId: 'list-1',
      type: 'PRODUCT_ADDED',
      payload: {},
      actorId: 'user-2',
    })

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists', 'list-1', 'products'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists', 'list-1'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists'],
    })
  })

  it('debe invalidar ante PRODUCT_MARKED y PRODUCT_DELETED', () => {
    renderSync('list-1')

    for (const type of [
      'PRODUCT_MARKED',
      'PRODUCT_DELETED',
      'PRODUCT_UPDATED',
    ]) {
      onEvent!({ listId: 'list-1', type, payload: {}, actorId: 'user-2' })
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['lists', 'list-1', 'products'],
      })
    }
  })

  it('debe invalidar el detalle ante LIST_UPDATED', () => {
    renderSync('list-1')

    onEvent!({
      listId: 'list-1',
      type: 'LIST_UPDATED',
      payload: {},
      actorId: 'user-2',
    })

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists', 'list-1'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists'],
    })
  })

  it('debe ignorar los eventos propios (actorId === usuario actual)', () => {
    renderSync('list-1')

    onEvent!({
      listId: 'list-1',
      type: 'PRODUCT_ADDED',
      payload: {},
      actorId: 'user-1',
    })

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
  })

  it('debe procesar eventos sin actorId (cambios del sistema)', () => {
    renderSync('list-1')

    onEvent!({ listId: 'list-1', type: 'PRODUCT_ADDED', payload: {} })

    expect(queryClient.invalidateQueries).toHaveBeenCalled()
  })

  it('debe reiniciar la suscripción cuando cambia el listId', () => {
    const { rerender } = renderHook(
      ({ listId }: { listId: string }) => useListSync(listId),
      {
        initialProps: { listId: 'list-1' },
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    )

    rerender({ listId: 'list-2' })

    expect(cleanupFn).toHaveBeenCalledTimes(1)
    expect(mockCreateStream).toHaveBeenCalledTimes(2)
    expect(mockCreateStream).toHaveBeenLastCalledWith(
      'list-2',
      'token-123',
      expect.anything(),
    )
  })
})

describe('useListSync: ramas restantes', () => {
  const ORIGINAL_ENV = process.env['NEXT_PUBLIC_LIST_SYNC_DISABLED']

  let queryClient: QueryClient
  let onEvent: (event: ListSyncEvent) => void
  let cleanupFn: jest.Mock

  beforeEach(() => {
    queryClient = createTestQueryClient()
    cleanupFn = jest.fn()
    mockCreateStream.mockImplementation(
      (_listId: string, _token: string, opts: { onEvent: typeof onEvent }) => {
        onEvent = opts.onEvent
        return cleanupFn
      },
    )
    mockUseSession.mockReturnValue({ data: SESSION, status: 'authenticated' })
    jest.spyOn(queryClient, 'invalidateQueries')
  })

  afterEach(() => {
    queryClient.clear()
    jest.clearAllMocks()
    if (ORIGINAL_ENV === undefined) {
      delete process.env['NEXT_PUBLIC_LIST_SYNC_DISABLED']
    } else {
      process.env['NEXT_PUBLIC_LIST_SYNC_DISABLED'] = ORIGINAL_ENV
    }
  })

  const renderSync = (listId = 'list-1') =>
    renderHook(() => useListSync(listId), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

  it('no se suscribe cuando NEXT_PUBLIC_LIST_SYNC_DISABLED=1', () => {
    process.env['NEXT_PUBLIC_LIST_SYNC_DISABLED'] = '1'

    renderSync('list-1')

    expect(mockCreateStream).not.toHaveBeenCalled()
  })

  it('eventos de tipo desconocido no invalidan nada', () => {
    process.env['NEXT_PUBLIC_LIST_SYNC_DISABLED'] = undefined

    renderSync('list-1')
    onEvent!({ listId: 'list-1', type: 'KEEP_ALIVE', payload: {} })

    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
  })

  it('LIST_DELETED también invalida el detalle y el listado', () => {
    process.env['NEXT_PUBLIC_LIST_SYNC_DISABLED'] = undefined

    renderSync('list-1')
    onEvent!({
      listId: 'list-1',
      type: 'LIST_DELETED',
      payload: {},
      actorId: 'user-2',
    })

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists', 'list-1'],
    })
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['lists'],
    })
  })
})
