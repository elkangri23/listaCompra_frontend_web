import { QueryClient } from '@tanstack/react-query';
import { Session } from 'next-auth';

/**
 * Crea un QueryClient mockeado para tests
 * Sin persistencia, sin retry
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Mock de sesión autenticada para tests
 */
export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    roles: ['Usuario'],
  },
  expires: '2025-12-31',
  accessToken: 'mock-access-token',
};

/**
 * Mock de sesión admin para tests
 */
export const mockAdminSession: Session = {
  user: {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@example.com',
    roles: ['Administrador'],
  },
  expires: '2025-12-31',
  accessToken: 'mock-admin-token',
};

/**
 * Mock del router de Next.js para tests
 */
export function createMockRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  };
}

/**
 * Mock de useSession para next-auth
 */
export function mockUseSession(session: Session | null = mockSession) {
  return {
    data: session,
    status: session ? ('authenticated' as const) : ('unauthenticated' as const),
    update: jest.fn(),
  };
}

/**
 * Mock de axios response
 */
export function createMockAxiosResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

/**
 * Mock de axios error
 */
export function createMockAxiosError(message: string, status = 500) {
  return {
    response: {
      data: { message },
      status,
      statusText: 'Error',
      headers: {},
      config: {} as any,
    },
    message,
    isAxiosError: true,
    toJSON: () => ({}),
  };
}

/**
 * Esperar a que se completen todas las promesas pendientes
 */
export async function waitForPromises() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Mock de fecha para tests con fechas
 */
export function mockDate(date: string | Date) {
  const mockDate = new Date(date);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
}

/**
 * Restaurar fecha real
 */
export function restoreDate() {
  jest.spyOn(global, 'Date').mockRestore();
}
