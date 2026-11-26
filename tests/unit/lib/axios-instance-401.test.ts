import { getSession } from 'next-auth/react';
import { axiosInstance } from '@/lib/api/axios-instance';

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

const mockGetSession = getSession as jest.Mock;

describe('axios-instance: 401 y redirección a /login', () => {
  // En jsdom, asignar window.location.href no navega de verdad: jsdom lo
  // rechaza con "Not implemented: navigation" por console.error. Ese
  // aviso es lo que usamos para detectar si el código intentó redirigir.
  let errorSpy: jest.SpyInstance;

  const navigationAttempted = () =>
    errorSpy.mock.calls.some(args =>
      String(args[0]).includes('Not implemented: navigation'),
    );

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Adaptador falso que siempre responde 401.
    axiosInstance.defaults.adapter = jest.fn(async config => {
      const error: any = new Error('Request failed with status code 401');
      error.config = config;
      error.response = { status: 401, data: {}, headers: {}, config };
      throw error;
    }) as any;
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('con 401 y sesión muerta redirige a /login', async () => {
    mockGetSession.mockResolvedValue(null);

    await expect(axiosInstance.get('/lists')).rejects.toThrow('401');

    expect(navigationAttempted()).toBe(true);
  });

  it('con 401 y getSession caído NO redirige (no bucle login <-> dashboard)', async () => {
    mockGetSession.mockRejectedValue(new Error('502 Bad Gateway'));

    await expect(axiosInstance.get('/lists')).rejects.toThrow('401');

    expect(navigationAttempted()).toBe(false);
  });
});
