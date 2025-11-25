/**
 * Tests CRÍTICOS (100% coverage) - invitation-service.ts
 * Servicios de invitaciones y colaboración en listas
 * 
 * Patrón: Arrange-Act-Assert
 * Mock: axios-instance
 * Seguridad: Validación de permisos, enlaces compartidos, expiración
 */

import { invitationService } from '@/features/invitations/services/invitation-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { createMockAxiosResponse, createMockAxiosError } from '../../utils/test-utils';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock del adapter
jest.mock('@/lib/adapters/invitation-adapter', () => ({
  InvitationAdapter: {
    toBackendRequest: jest.fn((data) => ({
      tipoPermiso: data.permissions === 'edit' ? 'ESCRITURA' : 'LECTURA',
      duracionHoras: data.expiresIn,
    })),
    fromBackendResponse: jest.fn((data) => ({
      hash: data.hash,
      url: `https://app.example.com/invite/${data.hash}`,
      expiresAt: data.fechaExpiracion,
    })),
  },
}));

describe('invitationService (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteUser', () => {
    it('debe invitar usuario con permisos de lectura', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await invitationService.inviteUser('list-1', 'user@example.com', 'LECTURA');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/invitations/list-1/share',
        {
          email: 'user@example.com',
          tipoPermiso: 'LECTURA',
        }
      );
    });

    it('debe invitar usuario con permisos de escritura', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await invitationService.inviteUser('list-1', 'user@example.com', 'ESCRITURA');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/invitations/list-1/share',
        {
          email: 'user@example.com',
          tipoPermiso: 'ESCRITURA',
        }
      );
    });

    it('debe usar permisos de lectura por defecto', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await invitationService.inviteUser('list-1', 'user@example.com');

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/invitations/list-1/share',
        {
          email: 'user@example.com',
          tipoPermiso: 'LECTURA',
        }
      );
    });

    it('debe rechazar email inválido', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Email inválido', 400)
      );

      await expect(
        invitationService.inviteUser('list-1', 'invalid-email')
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it('debe rechazar usuario ya invitado', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Usuario ya tiene acceso', 409)
      );

      await expect(
        invitationService.inviteUser('list-1', 'existing@example.com')
      ).rejects.toMatchObject({
        response: { status: 409 },
      });
    });
  });

  describe('getPendingInvitations', () => {
    it('debe obtener invitaciones pendientes', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          listaId: 'list-1',
          nombreLista: 'Lista Supermercado',
          invitadoPor: 'admin@example.com',
          tipoPermiso: 'LECTURA',
        },
        {
          id: 'inv-2',
          listaId: 'list-2',
          nombreLista: 'Lista Farmacia',
          invitadoPor: 'user@example.com',
          tipoPermiso: 'ESCRITURA',
        },
      ];

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockInvitations)
      );

      const result = await invitationService.getPendingInvitations();

      expect(axiosInstance.get).toHaveBeenCalledWith('/invitations/pending');
      expect(result).toHaveLength(2);
      expect(result[0].nombreLista).toBe('Lista Supermercado');
    });

    it('debe retornar array vacío si no hay invitaciones', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse([])
      );

      const result = await invitationService.getPendingInvitations();

      expect(result).toHaveLength(0);
    });

    it('debe manejar error al obtener invitaciones', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error del servidor', 500)
      );

      await expect(
        invitationService.getPendingInvitations()
      ).rejects.toMatchObject({
        message: 'Error del servidor',
      });
    });
  });

  describe('declineInvitation', () => {
    it('debe rechazar una invitación', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await invitationService.declineInvitation('inv-1');

      expect(axiosInstance.post).toHaveBeenCalledWith('/invitations/inv-1/decline');
    });

    it('debe manejar invitación no encontrada', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Invitación no encontrada', 404)
      );

      await expect(
        invitationService.declineInvitation('invalid-id')
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });

  describe('getInvitationByHash', () => {
    it('debe obtener invitación por hash válido', async () => {
      const mockInvitation = {
        hash: 'abc123',
        listaId: 'list-1',
        nombreLista: 'Lista Compartida',
        tipoPermiso: 'LECTURA',
        fechaExpiracion: new Date('2025-12-31').toISOString(),
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockInvitation)
      );

      const result = await invitationService.getInvitationByHash('abc123');

      expect(axiosInstance.get).toHaveBeenCalledWith('/invitations/abc123/access');
      expect(result.hash).toBe('abc123');
      expect(result.nombreLista).toBe('Lista Compartida');
    });

    it('debe rechazar hash inválido', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Hash inválido', 404)
      );

      await expect(
        invitationService.getInvitationByHash('invalid-hash')
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe rechazar hash expirado', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Invitación expirada', 410)
      );

      await expect(
        invitationService.getInvitationByHash('expired-hash')
      ).rejects.toMatchObject({
        response: { status: 410 },
      });
    });
  });

  describe('getInvitationsByList', () => {
    it('debe obtener invitaciones activas de una lista', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          usuarioId: 'user-1',
          email: 'user1@example.com',
          tipoPermiso: 'LECTURA',
        },
        {
          id: 'inv-2',
          usuarioId: 'user-2',
          email: 'user2@example.com',
          tipoPermiso: 'ESCRITURA',
        },
      ];

      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockInvitations)
      );

      const result = await invitationService.getInvitationsByList('list-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/invitations/list-1/list');
      expect(result).toHaveLength(2);
    });

    it('debe retornar array vacío para lista sin invitaciones', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        createMockAxiosResponse([])
      );

      const result = await invitationService.getInvitationsByList('list-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('updatePermissions', () => {
    it('debe actualizar permisos de usuario', async () => {
      (axiosInstance.put as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await invitationService.updatePermissions('list-1', 'user-1', {
        tipoPermiso: 'ESCRITURA',
      });

      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/invitations/list-1/permissions/user-1',
        { tipoPermiso: 'ESCRITURA' }
      );
    });

    it('debe manejar usuario no encontrado', async () => {
      (axiosInstance.put as jest.Mock).mockRejectedValue(
        createMockAxiosError('Usuario no tiene acceso', 404)
      );

      await expect(
        invitationService.updatePermissions('list-1', 'invalid-user', {
          tipoPermiso: 'LECTURA',
        })
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe rechazar permisos inválidos', async () => {
      (axiosInstance.put as jest.Mock).mockRejectedValue(
        createMockAxiosError('Tipo de permiso inválido', 400)
      );

      await expect(
        invitationService.updatePermissions('list-1', 'user-1', {
          tipoPermiso: 'INVALID' as any,
        })
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  describe('generateShareLink', () => {
    it('debe generar enlace compartido con adaptador', async () => {
      const mockBackendResponse = {
        hash: 'xyz789',
        fechaExpiracion: '2025-12-31T23:59:59Z',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockBackendResponse)
      );

      const result = await invitationService.generateShareLink('list-1', {
        permissions: 'edit',
        expiresIn: 24,
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/invitations/list-1/share',
        {
          tipoPermiso: 'ESCRITURA',
          duracionHoras: 24,
        }
      );
      expect(result.hash).toBe('xyz789');
      expect(result.url).toContain('xyz789');
    });

    it('debe generar enlace con permisos de lectura', async () => {
      const mockBackendResponse = {
        hash: 'abc123',
        fechaExpiracion: '2025-12-31T23:59:59Z',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(
        createMockAxiosResponse(mockBackendResponse)
      );

      await invitationService.generateShareLink('list-1', {
        permissions: 'view',
        expiresIn: 48,
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/invitations/list-1/share',
        {
          tipoPermiso: 'LECTURA',
          duracionHoras: 48,
        }
      );
    });

    it('debe manejar error al generar enlace', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Error al generar enlace', 500)
      );

      await expect(
        invitationService.generateShareLink('list-1', {
          permissions: 'view',
          expiresIn: 24,
        })
      ).rejects.toMatchObject({
        message: 'Error al generar enlace',
      });
    });
  });

  describe('revokePermission', () => {
    it('debe revocar permisos de usuario', async () => {
      (axiosInstance.delete as jest.Mock).mockResolvedValue(
        createMockAxiosResponse({ success: true })
      );

      await invitationService.revokePermission('list-1', 'user-1');

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        '/invitations/list-1/permissions/user-1'
      );
    });

    it('debe manejar usuario sin acceso', async () => {
      (axiosInstance.delete as jest.Mock).mockRejectedValue(
        createMockAxiosError('Usuario no tiene acceso', 404)
      );

      await expect(
        invitationService.revokePermission('list-1', 'invalid-user')
      ).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it('debe manejar permisos insuficientes para revocar', async () => {
      (axiosInstance.delete as jest.Mock).mockRejectedValue(
        createMockAxiosError('No autorizado', 403)
      );

      await expect(
        invitationService.revokePermission('list-1', 'user-1')
      ).rejects.toMatchObject({
        response: { status: 403 },
      });
    });
  });
});
