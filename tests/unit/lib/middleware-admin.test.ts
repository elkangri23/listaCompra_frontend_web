/**
 * Tests - Guardado por rol del middleware en /admin/* (fase 1 del panel).
 *
 * @jest-environment node
 *
 * Sin sesión → /login; con sesión sin rol ADMIN → /dashboard; con ADMIN → pasa.
 */
import middleware from '@/middleware';

jest.mock('@/lib/auth/next-auth', () => ({
  auth: (handler: unknown) => handler,
}));

const makeRequest = (pathname: string, session: unknown) => ({
  nextUrl: new URL(`http://localhost${pathname}`),
  auth: session,
});

const adminSession = {
  user: { id: 'a1', email: 'admin@ejemplo.com', name: 'Admin', roles: ['ADMIN'] },
};

const userSession = {
  user: { id: 'u1', email: 'usuario@ejemplo.com', name: 'Usuario', roles: ['USUARIO'] },
};

describe('Middleware: guardado de /admin', () => {
  it('sin sesión redirige a /login', async () => {
    const response = await (middleware as any)(
      makeRequest('/admin', null),
    );

    expect(response.headers.get('location')).toContain('/login');
  });

  it('con sesión USUARIO redirige a /dashboard', async () => {
    const response = await (middleware as any)(
      makeRequest('/admin', userSession),
    );

    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('con sesión USUARIO redirige también en /admin/users', async () => {
    const response = await (middleware as any)(
      makeRequest('/admin/users', userSession),
    );

    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('con sesión ADMIN deja pasar a /admin', async () => {
    const response = await (middleware as any)(
      makeRequest('/admin', adminSession),
    );

    expect(response.headers.get('location')).toBeNull();
  });

  it('con sesión USUARIO deja pasar a /dashboard', async () => {
    const response = await (middleware as any)(
      makeRequest('/dashboard', userSession),
    );

    expect(response.headers.get('location')).toBeNull();
  });
});
