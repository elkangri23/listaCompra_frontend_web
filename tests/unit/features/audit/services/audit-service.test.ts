import { auditService } from '@/features/audit/services/audit-service';
import { axiosInstance } from '@/lib/api/axios-instance';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
  },
}));

const mockedGet = axiosInstance.get as jest.Mock;

describe('audit-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getListAuditHistory', () => {
    it('devuelve el historial de una lista', async () => {
      const mockResponse = {
        success: true,
        data: {
          entries: [
            {
              id: 'e1',
              entityType: 'Producto',
              entityId: 'p1',
              changeType: 'UPDATE',
              changedByUserId: 'u1',
              timestamp: '2026-11-26T15:27:21.148Z',
              changedFields: ['comprado'],
              oldValue: { comprado: false },
              newValue: { comprado: true, nombre: 'Leche' },
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
      mockedGet.mockResolvedValue({ data: mockResponse });

      const result = await auditService.getListAuditHistory('l1');

      expect(mockedGet).toHaveBeenCalledWith('/audit/lists/l1', {
        params: { page: 1, pageSize: 10 },
      });
      expect(result.total).toBe(1);
      expect(result.entries[0].entityType).toBe('Producto');
    });

    it('pasa el filtro de tipo de cambio como query param', async () => {
      mockedGet.mockResolvedValue({
        data: { success: true, data: { entries: [], total: 0, page: 2, pageSize: 10, totalPages: 0 } },
      });

      await auditService.getListAuditHistory('l1', { page: 2, changeType: 'DELETE' });

      expect(mockedGet).toHaveBeenCalledWith('/audit/lists/l1', {
        params: { page: 2, pageSize: 10, changeType: 'DELETE' },
      });
    });
  });

  describe('getListCollaborators', () => {
    it('devuelve el array de colaboradores sin envoltorio', async () => {
      const collaborators = [
        { id: 'c1', userId: 'u1', userName: 'Antonio', userEmail: 'a@test.es', role: 'OWNER', joinedAt: '2026-11-01' },
      ];
      mockedGet.mockResolvedValue({ data: collaborators });

      const result = await auditService.getListCollaborators('l1');

      expect(mockedGet).toHaveBeenCalledWith('/lists/l1/collaborators');
      expect(result).toEqual(collaborators);
    });
  });
});
