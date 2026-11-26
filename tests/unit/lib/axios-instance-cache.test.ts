import { getSession } from 'next-auth/react';
import { axiosInstance } from '@/lib/api/axios-instance';

jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

const mockGetSession = getSession as jest.Mock;

function fakeJwt(expSecondsFromNow: number): string {
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  return `eyJhbGciOiJIUzI1NiJ9.${payload}.firma`;
}

describe('axios-instance: caché del access token', () => {
  let seenAuthHeaders: (string | undefined)[];

  beforeEach(() => {
    jest.clearAllMocks();
    seenAuthHeaders = [];
    axiosInstance.defaults.adapter = jest.fn(async config => {
      seenAuthHeaders.push(config.headers?.Authorization as string | undefined);
      return {
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }) as any;
  });

  it('usa el token de la sesión y lo cachea sin volver a llamar a getSession', async () => {
    const token = fakeJwt(3600);
    mockGetSession.mockResolvedValue({ accessToken: token });

    await axiosInstance.get('/lists');
    await axiosInstance.get('/lists');

    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(seenAuthHeaders).toEqual([`Bearer ${token}`, `Bearer ${token}`]);
  });

  it('si getSession falla con el token caducado, usa el último token cacheado', async () => {
    // La caché ya tiene el token válido del test anterior; avanzamos el
    // reloj para que caduque y el interceptor tenga que pedir sesión.
    const realNow = Date.now;
    const jumpMs = 3600 * 1000 + 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => realNow() + jumpMs);

    try {
      mockGetSession.mockRejectedValue(new Error('502 Bad Gateway'));
      await axiosInstance.get('/lists');

      // La sesión no responde: la llamada sale igualmente con el token
      // cacheado (aunque caducado) en vez de salir sin cabecera.
      expect(seenAuthHeaders[0]).toMatch(/^Bearer eyJ/);
    } finally {
      (Date.now as jest.Mock).mockRestore();
    }
  });
});
