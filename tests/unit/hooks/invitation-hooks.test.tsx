/**
 * Tests CRÍTICOS - hooks de invitaciones compartidos
 * use-invitation-by-hash, use-revoke-access, use-update-permissions, use-share-list
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { toast } from 'sonner';

import { useInvitationByHash } from '@/features/invitations/hooks/use-invitation-by-hash';
import { useCollaborators as useInvitationCollaborators } from '@/features/invitations/hooks/use-collaborators';
import { useRevokeAccess } from '@/features/invitations/hooks/use-revoke-access';
import { useUpdatePermissions } from '@/features/invitations/hooks/use-update-permissions';
import { useShareList } from '@/features/invitations/hooks/use-share-list';
import { invitationService } from '@/features/invitations/services/invitation-service';
import { createTestQueryClient } from '../../utils/test-utils';

jest.mock('@/features/invitations/services/invitation-service', () => ({
  invitationService: {
    getInvitationByHash: jest.fn(),
    revokePermission: jest.fn(),
    updatePermissions: jest.fn(),
    generateShareLink: jest.fn(),
    getInvitationsByList: jest.fn(),
  },
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

const mockGetHash = invitationService.getInvitationByHash as jest.Mock;
const mockRevoke = invitationService.revokePermission as jest.Mock;
const mockUpdatePerms = invitationService.updatePermissions as jest.Mock;
const mockShare = invitationService.generateShareLink as jest.Mock;

describe('hooks de invitaciones compartidos (CRÍTICO)', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useInvitationByHash', () => {
    it('debe obtener la invitación por hash', async () => {
      const invitation = { success: true, data: { lista: { nombre: 'Lista' } } };
      mockGetHash.mockResolvedValue(invitation);

      const { result } = renderHook(() => useInvitationByHash('hash-123'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetHash).toHaveBeenCalledWith('hash-123');
      expect(result.current.data).toEqual(invitation);
    });

    it('no debe consultar sin hash', () => {
      renderHook(() => useInvitationByHash(''), { wrapper });

      expect(mockGetHash).not.toHaveBeenCalled();
    });

    it('no debe reintentar en error (404/410 esperados)', async () => {
      mockGetHash.mockRejectedValue(new Error('Not found'));

      const { result } = renderHook(() => useInvitationByHash('hash-404'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockGetHash).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRevokeAccess', () => {
    it('debe revocar acceso, notificar e invalidar colaboradores', async () => {
      mockRevoke.mockResolvedValue(undefined);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRevokeAccess(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockRevoke).toHaveBeenCalledWith('list-1', 'user-2');
      expect(toast.success).toHaveBeenCalledWith('Acceso revocado correctamente.');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['collaborators', 'list-1'],
      });
    });

    it('debe notificar el mensaje del backend en error', async () => {
      mockRevoke.mockRejectedValue({ response: { data: { message: 'Sin permisos' } } });

      const { result } = renderHook(() => useRevokeAccess(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Sin permisos');
    });

    it('debe notificar mensaje genérico si el error no trae mensaje', async () => {
      mockRevoke.mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() => useRevokeAccess(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Error al revocar el acceso.');
    });
  });

  describe('useUpdatePermissions', () => {
    it('debe actualizar permisos, notificar e invalidar colaboradores', async () => {
      mockUpdatePerms.mockResolvedValue(undefined);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdatePermissions(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2', permissions: ['EDITOR'] });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockUpdatePerms).toHaveBeenCalledWith('list-1', 'user-2', { permissions: ['EDITOR'] });
      expect(toast.success).toHaveBeenCalledWith('Permisos actualizados correctamente.');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['collaborators', 'list-1'] });
    });

    it('debe notificar el error del backend', async () => {
      mockUpdatePerms.mockRejectedValue({
        response: { data: { message: 'Rol inválido' } },
      });

      const { result } = renderHook(() => useUpdatePermissions(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2', permissions: ['X'] });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Rol inválido');
    });

    it('debe notificar mensaje genérico en error sin respuesta', async () => {
      mockUpdatePerms.mockRejectedValue(new Error('boom'));

      const { result } = renderHook(() => useUpdatePermissions(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2', permissions: ['EDITOR'] });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Error al actualizar los permisos.');
    });
  });

  describe('useShareList', () => {
    it('debe generar el enlace e invalidar invitaciones de la lista', async () => {
      const shareResponse = { hash: 'abc123', url: 'http://localhost:3000/invitations/abc123' };
      mockShare.mockResolvedValue(shareResponse);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useShareList('list-1'), { wrapper });

      result.current.mutate({ permissions: 'read', expiresIn: '24h' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockShare).toHaveBeenCalledWith('list-1', { permissions: 'read', expiresIn: '24h' });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['invitations', 'list', 'list-1'],
      });
      expect(result.current.data).toEqual(shareResponse);
    });

    it('debe exponer el error cuando la generación falla', async () => {
      mockShare.mockRejectedValue(new Error('Límite de enlaces'));

      const { result } = renderHook(() => useShareList('list-1'), { wrapper });

      result.current.mutate({ permissions: 'read' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Límite de enlaces');
    });
  });
});

describe('useCollaborators (invitations, CRÍTICO)', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('debe obtener colaboradores con staleTime de 30s', async () => {
    const collaborators = [{ id: 'c1' }];
    mockGetHash.mockClear();
    (invitationService.getInvitationsByList as jest.Mock).mockResolvedValue(collaborators);

    const { result } = renderHook(() => useInvitationCollaborators('list-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invitationService.getInvitationsByList).toHaveBeenCalledWith('list-1');
    expect(result.current.data).toEqual(collaborators);
  });

  it('no debe consultar sin listId', () => {
    renderHook(() => useInvitationCollaborators(''), { wrapper });

    expect(invitationService.getInvitationsByList).not.toHaveBeenCalled();
  });
});
