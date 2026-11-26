import { exportMyData, requestAccountDeletion } from '@/features/gdpr/services/gdpr-service';
import { axiosInstance } from '@/lib/api/axios-instance';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedGet = axiosInstance.get as jest.Mock;
const mockedDelete = axiosInstance.delete as jest.Mock;

describe('gdpr-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportMyData', () => {
    it('devuelve el blob y el nombre de archivo de la cabecera', async () => {
      const blob = new Blob(['{}'], { type: 'application/json' });
      mockedGet.mockResolvedValue({
        data: blob,
        headers: {
          'content-disposition': 'attachment; filename="mis-datos-lista-compra-2026-11-26.json"',
        },
      });

      const result = await exportMyData();

      expect(mockedGet).toHaveBeenCalledWith('/auth/me/export', { responseType: 'blob' });
      expect(result.blob).toBe(blob);
      expect(result.filename).toBe('mis-datos-lista-compra-2026-11-26.json');
    });

    it('usa un nombre por defecto sin cabecera Content-Disposition', async () => {
      const blob = new Blob(['{}'], { type: 'application/json' });
      mockedGet.mockResolvedValue({ data: blob, headers: {} });

      const result = await exportMyData();

      expect(result.filename).toBe('mis-datos-lista-compra.json');
    });

    it('lanza un error amable si la exportación falla', async () => {
      mockedGet.mockRejectedValue(new Error('Fallo de red'));

      await expect(exportMyData()).rejects.toThrow('Fallo de red');
    });
  });

  describe('requestAccountDeletion', () => {
    it('envía la contraseña y devuelve las fechas de eliminación', async () => {
      const payload = {
        mensaje: 'Cuenta desactivada',
        eliminacionSolicitadaEn: '2026-11-26T00:00:00.000Z',
        eliminacionDefinitivaEn: '2026-12-26T00:00:00.000Z',
      };
      mockedDelete.mockResolvedValue({ data: payload });

      const result = await requestAccountDeletion('SecurePass123!');

      expect(mockedDelete).toHaveBeenCalledWith('/auth/me', {
        data: { password: 'SecurePass123!' },
      });
      expect(result).toEqual(payload);
    });

    it('lanza el mensaje del backend si la contraseña es incorrecta', async () => {
      mockedDelete.mockRejectedValue({
        response: { data: { message: 'La contraseña actual no es correcta' } },
        isAxiosError: true,
      });

      await expect(requestAccountDeletion('ClaveMala123!')).rejects.toThrow(
        'La contraseña actual no es correcta',
      );
    });
  });
});

describe('gdpr-service (ramas de error)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('usa el campo error del backend cuando no hay message', async () => {
    mockedDelete.mockRejectedValue({
      response: { data: { error: 'Error de validación' } },
      isAxiosError: true,
    });

    await expect(requestAccountDeletion('x')).rejects.toThrow('Error de validación');
  });

  it('usa el mensaje por defecto si el fallo no es un error ni una respuesta', async () => {
    mockedGet.mockRejectedValue('boom');

    await expect(exportMyData()).rejects.toThrow(
      'No se pudieron exportar tus datos. Inténtalo nuevamente.',
    );
  });
});
