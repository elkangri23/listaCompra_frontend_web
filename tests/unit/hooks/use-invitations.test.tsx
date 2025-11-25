/**
 * Tests CRÍTICOS (100% coverage) - use-invitations.ts
 * Hooks de React Query para gestión de invitaciones
 * 
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react-hooks
 * Mock: invitationService
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { invitationService } from '@/features/invitations/services/invitation-service';
import {
  usePendingInvitations,
  useInvitationByHash,
  useInvitationsByList,
  useInviteUser,
  useDeclineInvitation,
  useUpdatePermissions,
} from '@/features/invitations/hooks/use-invitations';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/invitations/services/invitation-service', () => ({
  invitationService: {
    getPendingInvitations: jest.fn(),
    getInvitationByHash: jest.fn(),
    getInvitationsByList: jest.fn(),
    inviteUser: jest.fn(),
    declineInvitation: jest.fn(),
    updatePermissions: jest.fn(),
  },
}));

describe('useInvitations hooks (CRÍTICO - 100% coverage)', () => {
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

  describe('usePendingInvitations', () => {
    it('debe obtener invitaciones pendientes', async () => {
      const mockInvitations = [
        { id: 'inv-1', listaId: 'list-1', estado: 'PENDIENTE', email: 'user@example.com' },
        { id: 'inv-2', listaId: 'list-2', estado: 'PENDIENTE', email: 'other@example.com' },
      ];

      (invitationService.getPendingInvitations as jest.Mock).mockResolvedValue(mockInvitations);

      const { result } = renderHook(() => usePendingInvitations(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockInvitations);
      expect(invitationService.getPendingInvitations).toHaveBeenCalledTimes(1);
    });

    it('debe manejar lista vacía de invitaciones', async () => {
      (invitationService.getPendingInvitations as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePendingInvitations(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('debe manejar error al obtener invitaciones', async () => {
      (invitationService.getPendingInvitations as jest.Mock).mockRejectedValue(
        new Error('Error del servidor')
      );

      const { result } = renderHook(() => usePendingInvitations(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useInvitationByHash', () => {
    it('debe obtener invitación por hash', async () => {
      const mockInvitation = {
        id: 'inv-1',
        listaId: 'list-1',
        hash: 'abc123def',
        estado: 'PENDIENTE',
      };

      (invitationService.getInvitationByHash as jest.Mock).mockResolvedValue(mockInvitation);

      const { result } = renderHook(() => useInvitationByHash('abc123def'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockInvitation);
      expect(invitationService.getInvitationByHash).toHaveBeenCalledWith('abc123def');
    });

    it('NO debe hacer fetch si hash está vacío', async () => {
      const { result } = renderHook(() => useInvitationByHash(''), { wrapper });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(invitationService.getInvitationByHash).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });

    it('debe manejar invitación expirada', async () => {
      (invitationService.getInvitationByHash as jest.Mock).mockRejectedValue(
        new Error('Invitación expirada')
      );

      const { result } = renderHook(() => useInvitationByHash('expired-hash'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('debe manejar hash inválido', async () => {
      (invitationService.getInvitationByHash as jest.Mock).mockRejectedValue(
        new Error('Hash inválido')
      );

      const { result } = renderHook(() => useInvitationByHash('invalid'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useInvitationsByList', () => {
    it('debe obtener invitaciones de una lista', async () => {
      const mockInvitations = [
        { id: 'inv-1', email: 'user1@example.com', tipoPermiso: 'LECTURA' },
        { id: 'inv-2', email: 'user2@example.com', tipoPermiso: 'ESCRITURA' },
      ];

      (invitationService.getInvitationsByList as jest.Mock).mockResolvedValue(mockInvitations);

      const { result } = renderHook(() => useInvitationsByList('list-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockInvitations);
      expect(invitationService.getInvitationsByList).toHaveBeenCalledWith('list-1');
    });

    it('NO debe hacer fetch si listId está vacío', async () => {
      const { result } = renderHook(() => useInvitationsByList(''), { wrapper });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(invitationService.getInvitationsByList).not.toHaveBeenCalled();
    });

    it('debe manejar lista sin invitaciones', async () => {
      (invitationService.getInvitationsByList as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useInvitationsByList('list-empty'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useInviteUser', () => {
    it('debe invitar usuario con permiso de LECTURA por defecto', async () => {
      const mockResponse = { id: 'inv-new', email: 'new@example.com', tipoPermiso: 'LECTURA' };
      (invitationService.inviteUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useInviteUser('list-1'), { wrapper });

      result.current.mutate({ email: 'new@example.com' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invitationService.inviteUser).toHaveBeenCalledWith('list-1', 'new@example.com', 'LECTURA');
      expect(result.current.data).toEqual(mockResponse);
    });

    it('debe invitar usuario con permiso de ESCRITURA', async () => {
      const mockResponse = { id: 'inv-new', email: 'editor@example.com', tipoPermiso: 'ESCRITURA' };
      (invitationService.inviteUser as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useInviteUser('list-1'), { wrapper });

      result.current.mutate({ email: 'editor@example.com', tipoPermiso: 'ESCRITURA' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invitationService.inviteUser).toHaveBeenCalledWith('list-1', 'editor@example.com', 'ESCRITURA');
    });

    it('debe invalidar cache de invitaciones después de invitar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (invitationService.inviteUser as jest.Mock).mockResolvedValue({ id: 'inv-1' });

      const { result } = renderHook(() => useInviteUser('list-1'), { wrapper });

      result.current.mutate({ email: 'test@example.com' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['invitations', 'list', 'list-1'] });
    });

    it('debe manejar error por límite de invitaciones', async () => {
      (invitationService.inviteUser as jest.Mock).mockRejectedValue(
        new Error('Límite de invitaciones alcanzado')
      );

      const { result } = renderHook(() => useInviteUser('list-1'), { wrapper });

      result.current.mutate({ email: 'test@example.com' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('debe manejar email duplicado', async () => {
      (invitationService.inviteUser as jest.Mock).mockRejectedValue(
        new Error('Usuario ya invitado')
      );

      const { result } = renderHook(() => useInviteUser('list-1'), { wrapper });

      result.current.mutate({ email: 'duplicate@example.com' });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useDeclineInvitation', () => {
    it('debe rechazar invitación correctamente', async () => {
      (invitationService.declineInvitation as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeclineInvitation(), { wrapper });

      result.current.mutate('inv-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invitationService.declineInvitation).toHaveBeenCalledWith('inv-1');
    });

    it('debe invalidar cache de invitaciones pendientes después de rechazar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (invitationService.declineInvitation as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeclineInvitation(), { wrapper });

      result.current.mutate('inv-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['invitations', 'pending'] });
    });

    it('debe manejar invitación no encontrada', async () => {
      (invitationService.declineInvitation as jest.Mock).mockRejectedValue(
        new Error('Invitación no encontrada')
      );

      const { result } = renderHook(() => useDeclineInvitation(), { wrapper });

      result.current.mutate('invalid-id');

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useUpdatePermissions', () => {
    it('debe actualizar permisos a ESCRITURA', async () => {
      const mockResponse = { userId: 'user-1', tipoPermiso: 'ESCRITURA' };
      (invitationService.updatePermissions as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdatePermissions('list-1', 'user-1'), { wrapper });

      result.current.mutate({ tipoPermiso: 'ESCRITURA' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invitationService.updatePermissions).toHaveBeenCalledWith(
        'list-1',
        'user-1',
        { tipoPermiso: 'ESCRITURA' }
      );
    });

    it('debe actualizar permisos a LECTURA', async () => {
      const mockResponse = { userId: 'user-1', tipoPermiso: 'LECTURA' };
      (invitationService.updatePermissions as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdatePermissions('list-1', 'user-1'), { wrapper });

      result.current.mutate({ tipoPermiso: 'LECTURA' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('debe invalidar múltiples caches después de actualizar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      (invitationService.updatePermissions as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useUpdatePermissions('list-1', 'user-1'), { wrapper });

      result.current.mutate({ tipoPermiso: 'ESCRITURA' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['invitations', 'list', 'list-1'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists', 'list-1'] });
    });

    it('debe manejar permisos insuficientes', async () => {
      (invitationService.updatePermissions as jest.Mock).mockRejectedValue(
        new Error('No tienes permisos para cambiar esto')
      );

      const { result } = renderHook(() => useUpdatePermissions('list-1', 'user-2'), { wrapper });

      result.current.mutate({ tipoPermiso: 'ESCRITURA' });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
