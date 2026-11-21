/**
 * Tests CRÍTICOS - lists/hooks/use-collaborators.ts y use-permissions.ts
 * Hooks de colaboradores y permisos por rol
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

import {
  useCollaborators,
  useRemoveCollaborator,
  useUpdateCollaboratorRole,
} from '@/features/lists/hooks/use-collaborators';
import {
  useListPermissions,
  useCanEditList,
  useCanDeleteList,
  useCanInviteUsers,
  useIsListOwner,
} from '@/features/lists/hooks/use-permissions';
import { collaboratorService } from '@/features/lists/services/collaborator-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { Collaborator, CollaboratorRole } from '@/types/Collaborator.types';

jest.mock('@/features/lists/services/collaborator-service', () => ({
  collaboratorService: {
    getCollaborators: jest.fn(),
    removeCollaborator: jest.fn(),
    updateCollaboratorRole: jest.fn(),
  },
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockGetCollaborators = collaboratorService.getCollaborators as jest.Mock;
const mockRemove = collaboratorService.removeCollaborator as jest.Mock;
const mockUpdateRole = collaboratorService.updateCollaboratorRole as jest.Mock;

const makeCollaborator = (userId: string, role: CollaboratorRole): Collaborator =>
  ({
    id: `collab-${userId}`,
    userId,
    userName: `Usuario ${userId}`,
    userEmail: `${userId}@example.com`,
    role,
    joinedAt: new Date('2025-01-01'),
  } as Collaborator);

describe('useCollaborators / usePermissions (CRÍTICO)', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-1', name: 'Usuario', email: 'u1@example.com' } },
      status: 'authenticated',
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useCollaborators', () => {
    it('debe obtener los colaboradores de la lista', async () => {
      mockGetCollaborators.mockResolvedValue([makeCollaborator('user-1', CollaboratorRole.OWNER)]);

      const { result } = renderHook(() => useCollaborators('list-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetCollaborators).toHaveBeenCalledWith('list-1');
    });

    it('no debe consultar sin listId', () => {
      renderHook(() => useCollaborators(''), { wrapper });

      expect(mockGetCollaborators).not.toHaveBeenCalled();
    });

    it('debe exponer isError en fallo del API', async () => {
      mockGetCollaborators.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useCollaborators('list-1'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useRemoveCollaborator', () => {
    it('debe eliminar colaborador e invalidar queries de la lista', async () => {
      mockRemove.mockResolvedValue(undefined);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useRemoveCollaborator(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockRemove).toHaveBeenCalledWith({ listId: 'list-1', userId: 'user-2' });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['lists', 'list-1', 'collaborators'],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['lists', 'list-1'] });
    });
  });

  describe('useUpdateCollaboratorRole', () => {
    it('debe actualizar el rol e invalidar colaboradores', async () => {
      mockUpdateRole.mockResolvedValue(makeCollaborator('user-2', CollaboratorRole.VIEWER));
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateCollaboratorRole(), { wrapper });

      result.current.mutate({ listId: 'list-1', userId: 'user-2', role: CollaboratorRole.VIEWER });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['lists', 'list-1', 'collaborators'],
      });
    });
  });

  describe('useListPermissions', () => {
    it('debe devolver permisos de OWNER para el propietario', async () => {
      mockGetCollaborators.mockResolvedValue([makeCollaborator('user-1', CollaboratorRole.OWNER)]);

      const { result } = renderHook(() => useListPermissions('list-1'), { wrapper });

      await waitFor(() => expect(result.current).not.toBeNull());
      expect(result.current?.canEdit).toBe(true);
      expect(result.current?.canDelete).toBe(true);
    });

    it('debe devolver permisos de VIEWER para un no-colaborador', async () => {
      mockGetCollaborators.mockResolvedValue([makeCollaborator('user-2', CollaboratorRole.EDITOR)]);

      const { result } = renderHook(() => useListPermissions('list-1'), { wrapper });

      await waitFor(() => expect(result.current).not.toBeNull());
      expect(result.current?.canEdit).toBe(false);
    });

    it('debe devolver null sin sesión', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      const { result } = renderHook(() => useListPermissions('list-1'), { wrapper });

      expect(result.current).toBeNull();
    });
  });

  describe.each([
    ['useCanEditList', useCanEditList, 'canEdit'],
    ['useCanDeleteList', useCanDeleteList, 'canDelete'],
    ['useCanInviteUsers', useCanInviteUsers, 'canInvite'],
  ])('%s', (name, hook, permission) => {
    it(`debe devolver true cuando el usuario es OWNER (${permission})`, async () => {
      mockGetCollaborators.mockResolvedValue([makeCollaborator('user-1', CollaboratorRole.OWNER)]);

      const { result } = renderHook(() => hook('list-1'), { wrapper });

      await waitFor(() => expect(result.current).toBe(true));
    });

    it('debe devolver false sin permisos', async () => {
      mockGetCollaborators.mockResolvedValue([makeCollaborator('user-2', CollaboratorRole.VIEWER)]);

      const { result } = renderHook(() => hook('list-1'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });
  });

  describe('useIsListOwner', () => {
    it('debe devolver true para el propietario', async () => {
      mockGetCollaborators.mockResolvedValue([makeCollaborator('user-1', CollaboratorRole.OWNER)]);

      const { result } = renderHook(() => useIsListOwner('list-1'), { wrapper });

      await waitFor(() => expect(result.current).toBe(true));
    });

    it('debe devolver false para otro colaborador', async () => {
      mockGetCollaborators.mockResolvedValue([makeCollaborator('user-2', CollaboratorRole.EDITOR)]);

      const { result } = renderHook(() => useIsListOwner('list-1'), { wrapper });

      await waitFor(() => expect(result.current).toBe(false));
    });
  });
});
