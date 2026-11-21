/**
 * Tests CRÍTICOS - use-profile.ts
 * Hooks de perfil: consulta, actualización y cambio de contraseña
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';

import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
} from '@/features/auth/hooks/use-profile';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
} from '@/features/auth/services/auth-service';
import { createTestQueryClient } from '../../utils/test-utils';

jest.mock('@/features/auth/services/auth-service', () => ({
  getCurrentUser: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockUseSession = useSession as jest.Mock;
const mockGetCurrentUser = getCurrentUser as jest.Mock;
const mockUpdateProfile = updateProfile as jest.Mock;
const mockChangePassword = changePassword as jest.Mock;

const mockUser = {
  id: 'user-1',
  name: 'Usuario Test',
  email: 'test@example.com',
  image: null,
};

describe('useProfile hooks (CRÍTICO)', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated',
      update: jest.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useProfile', () => {
    it('debe obtener el perfil cuando hay sesión', async () => {
      mockGetCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockGetCurrentUser).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockUser);
    });

    it('no debe consultar el perfil sin sesión', () => {
      mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      renderHook(() => useProfile(), { wrapper });

      expect(mockGetCurrentUser).not.toHaveBeenCalled();
    });

    it('debe exponer isError cuando el API falla (retry 1)', async () => {
      mockGetCurrentUser.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useProfile(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(2); // 1 intento + 1 retry
    });
  });

  describe('useUpdateProfile', () => {
    it('debe actualizar el perfil e invalidar el cache', async () => {
      const updatedUser = { ...mockUser, name: 'Nombre Nuevo' };
      mockUpdateProfile.mockResolvedValue(updatedUser);
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      result.current.mutate({
        nombre: 'Nombre Nuevo',
        email: 'test@example.com',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        nombre: 'Nombre Nuevo',
        email: 'test@example.com',
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile'] });
    });

    it('debe exponer el error cuando la actualización falla', async () => {
      mockUpdateProfile.mockRejectedValue(new Error('Email duplicado'));

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      result.current.mutate({ nombre: 'X', email: 'test@example.com' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useChangePassword', () => {
    it('debe cambiar la contraseña', async () => {
      mockChangePassword.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useChangePassword(), { wrapper });

      result.current.mutate({
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'OldPassword1',
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      });
    });

    it('debe exponer el error cuando el cambio falla', async () => {
      mockChangePassword.mockRejectedValue(new Error('Contraseña incorrecta'));

      const { result } = renderHook(() => useChangePassword(), { wrapper });

      result.current.mutate({
        currentPassword: 'MalaPassword1',
        newPassword: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Contraseña incorrecta');
    });
  });
});
