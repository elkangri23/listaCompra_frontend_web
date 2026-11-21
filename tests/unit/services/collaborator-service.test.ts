/**
 * Tests CRÍTICOS - collaborator-service.ts
 * Servicios de gestión de colaboradores de una lista
 */

import { collaboratorService } from '@/features/lists/services/collaborator-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { Collaborator } from '@/types/Collaborator.types';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockCollaborator: Collaborator = {
  userId: 'user-2',
  listId: 'list-1',
  role: 'EDITOR',
  email: 'colab@example.com',
  nombre: 'Colaborador',
} as unknown as Collaborator;

describe('collaboratorService (CRÍTICO)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCollaborators', () => {
    it('debe obtener los colaboradores de una lista', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: [mockCollaborator] });

      const result = await collaboratorService.getCollaborators('list-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/lists/list-1/collaborators');
      expect(result).toEqual([mockCollaborator]);
    });

    it('debe propagar errores del API', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(collaboratorService.getCollaborators('list-1')).rejects.toThrow('Network error');
    });
  });

  describe('removeCollaborator', () => {
    it('debe eliminar un colaborador por listId y userId', async () => {
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await collaboratorService.removeCollaborator({ listId: 'list-1', userId: 'user-2' });

      expect(axiosInstance.delete).toHaveBeenCalledWith('/lists/list-1/collaborators/user-2');
    });

    it('debe propagar errores del API', async () => {
      (axiosInstance.delete as jest.Mock).mockRejectedValue(new Error('Forbidden'));

      await expect(
        collaboratorService.removeCollaborator({ listId: 'list-1', userId: 'user-2' })
      ).rejects.toThrow('Forbidden');
    });
  });

  describe('updateCollaboratorRole', () => {
    it('debe actualizar el rol enviando el body correcto', async () => {
      const updated = { ...mockCollaborator, role: 'VIEWER' };
      (axiosInstance.patch as jest.Mock).mockResolvedValue({ data: updated });

      const result = await collaboratorService.updateCollaboratorRole({
        listId: 'list-1',
        userId: 'user-2',
        role: 'VIEWER',
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/lists/list-1/collaborators/user-2', {
        role: 'VIEWER',
      });
      expect(result).toEqual(updated);
    });

    it('debe propagar errores del API', async () => {
      (axiosInstance.patch as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      await expect(
        collaboratorService.updateCollaboratorRole({ listId: 'list-1', userId: 'user-2', role: 'OWNER' })
      ).rejects.toThrow('Unauthorized');
    });
  });
});
