/**
 * Tests CRÍTICOS (100% coverage) - auth-service.ts
 * Servicios de autenticación y gestión de usuario
 * 
 * Patrón: Arrange-Act-Assert
 * Mock: axios-instance
 * Seguridad: Validación de tokens, normalización de emails, manejo de errores
 */

import {
  login,
  refreshToken,
  registerUser,
  requestPasswordReset,
  getCurrentUser,
  updateProfile,
  changePassword,
  AuthApiError,
} from '@/features/auth/services/auth-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import { createMockAxiosResponse, createMockAxiosError } from '../../utils/test-utils';
import { ApiUser, ApiLoginResponse } from '@/features/auth/types';

// Mock del módulo axios-instance
jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    defaults: {
      baseURL: 'http://localhost:3001/api',
    },
  },
}));

// Mock de console para evitar logs en tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

describe('auth-service (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe autenticar usuario con credenciales válidas', async () => {
      // Arrange
      const loginRequest = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser: ApiUser = {
        id: 'user-1',
        nombre: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        rol: 'Usuario',
        fechaRegistro: '2025-01-01T00:00:00Z',
      };

      const mockResponse: ApiLoginResponse = {
        success: true,
        data: {
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
          },
          user: mockUser,
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
      });

      // Act
      const result = await login(loginRequest);

      // Assert
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com', // normalizado
        password: 'Password123!',
      });
      expect(result.token).toBe('mock-access-token');
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('test@example.com');
    });

    it('debe normalizar email a minúsculas', async () => {
      // Arrange
      const loginRequest = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123!',
      };

      const mockResponse: ApiLoginResponse = {
        success: true,
        data: {
          tokens: {
            accessToken: 'token',
            refreshToken: 'refresh',
          },
          user: {
            id: '1',
            nombre: 'Test',
            apellidos: 'User',
            email: 'test@example.com',
            rol: 'Usuario',
            fechaRegistro: '2025-01-01T00:00:00Z',
          },
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
      });

      // Act
      await login(loginRequest);

      // Assert
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com', // normalizado y sin espacios
        password: 'Password123!',
      });
    });

    it('debe rechazar credenciales inválidas', async () => {
      // Arrange
      const loginRequest = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Credenciales inválidas', 401)
      );

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow(AuthApiError);
      await expect(login(loginRequest)).rejects.toMatchObject({
        message: 'Credenciales inválidas',
      });
    });

    it('debe manejar respuesta sin token', async () => {
      // Arrange
      const loginRequest = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const invalidResponse = {
        success: true,
        data: {
          tokens: {
            accessToken: '', // token vacío
            refreshToken: 'refresh',
          },
          user: {} as ApiUser,
        },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: invalidResponse,
        status: 200,
      });

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow(
        'La respuesta de la API no contiene un token válido.'
      );
    });

    it('debe manejar error de red', async () => {
      // Arrange
      const loginRequest = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow(AuthApiError);
    });
  });

  describe('refreshToken', () => {
    it('debe renovar token correctamente', async () => {
      // Arrange
      const refreshRequest = {
        refreshToken: 'old-refresh-token',
      };

      const mockResponse = {
        token: 'new-access-token',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
      });

      // Act
      const result = await refreshToken(refreshRequest);

      // Assert
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/refresh-token', {
        refreshToken: 'old-refresh-token',
      });
      expect(result.token).toBe('new-access-token');
    });

    it('debe rechazar token vacío', async () => {
      // Arrange
      const invalidRequest = {
        refreshToken: '',
      };

      // Act & Assert
      await expect(refreshToken(invalidRequest)).rejects.toThrow(
        'No se encontró el token para renovar la sesión.'
      );
    });

    it('debe rechazar token inválido', async () => {
      // Arrange
      const invalidRequest = {
        refreshToken: 'invalid-token',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Token inválido', 401)
      );

      // Act & Assert
      await expect(refreshToken(invalidRequest)).rejects.toThrow(AuthApiError);
    });

    it('debe manejar respuesta sin token', async () => {
      // Arrange
      const refreshRequest = {
        refreshToken: 'refresh-token',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: { token: null }, // token null
      });

      // Act & Assert
      await expect(refreshToken(refreshRequest)).rejects.toThrow(
        'La respuesta de la API no contiene un token de refresco válido.'
      );
    });
  });

  describe('registerUser', () => {
    it('debe registrar nuevo usuario', async () => {
      // Arrange
      const registerRequest = {
        nombre: '  John  ',
        apellidos: '  Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        password: 'SecurePass123!',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      // Act
      await registerUser(registerRequest);

      // Assert
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/register', {
        nombre: 'John', // sin espacios
        apellidos: 'Doe', // sin espacios
        email: 'john@example.com', // normalizado
        password: 'SecurePass123!',
      });
    });

    it('debe rechazar email duplicado', async () => {
      // Arrange
      const registerRequest = {
        nombre: 'John',
        apellidos: 'Doe',
        email: 'existing@example.com',
        password: 'Password123!',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Email ya registrado', 409)
      );

      // Act & Assert
      await expect(registerUser(registerRequest)).rejects.toThrow(AuthApiError);
    });

    it('debe rechazar contraseña débil', async () => {
      // Arrange
      const registerRequest = {
        nombre: 'John',
        apellidos: 'Doe',
        email: 'john@example.com',
        password: '123', // contraseña muy débil
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Contraseña muy débil', 400)
      );

      // Act & Assert
      await expect(registerUser(registerRequest)).rejects.toThrow(AuthApiError);
    });
  });

  describe('requestPasswordReset', () => {
    it('debe enviar enlace de recuperación', async () => {
      // Arrange
      const resetRequest = {
        email: '  TEST@EXAMPLE.COM  ',
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      // Act
      await requestPasswordReset(resetRequest);

      // Assert
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com', // normalizado
      });
    });

    it('debe manejar email no registrado', async () => {
      // Arrange
      const resetRequest = {
        email: 'notfound@example.com',
      };

      (axiosInstance.post as jest.Mock).mockRejectedValue(
        createMockAxiosError('Email no encontrado', 404)
      );

      // Act & Assert
      await expect(requestPasswordReset(resetRequest)).rejects.toThrow(
        AuthApiError
      );
    });
  });

  describe('getCurrentUser', () => {
    it('debe obtener usuario actual', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        nombre: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        rol: 'Usuario',
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: mockUser,
      });

      // Act
      const result = await getCurrentUser();

      // Assert
      expect(axiosInstance.get).toHaveBeenCalledWith('/users/me');
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('debe manejar sesión expirada', async () => {
      // Arrange
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        createMockAxiosError('Sesión expirada', 401)
      );

      // Act & Assert
      await expect(getCurrentUser()).rejects.toThrow(AuthApiError);
    });
  });

  describe('updateProfile', () => {
    it('debe actualizar perfil de usuario', async () => {
      // Arrange
      const profileValues = {
        nombre: '  John Updated  ',
        email: '  NEWEMAIL@EXAMPLE.COM  ',
        bio: '  This is my bio  ',
      };

      const updatedUser = {
        id: 'user-1',
        nombre: 'John Updated',
        email: 'newemail@example.com',
        bio: 'This is my bio',
      };

      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: updatedUser,
      });

      // Act
      const result = await updateProfile(profileValues);

      // Assert
      expect(axiosInstance.patch).toHaveBeenCalledWith('/users/me', {
        name: 'John Updated', // sin espacios
        email: 'newemail@example.com', // normalizado
        bio: 'This is my bio', // sin espacios
      });
      expect(result.email).toBe('newemail@example.com');
    });

    it('debe actualizar perfil sin bio', async () => {
      // Arrange
      const profileValues = {
        nombre: 'John',
        email: 'john@example.com',
      };

      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: { id: '1', nombre: 'John', email: 'john@example.com' },
      });

      // Act
      await updateProfile(profileValues);

      // Assert
      expect(axiosInstance.patch).toHaveBeenCalledWith('/users/me', {
        name: 'John',
        email: 'john@example.com',
        // bio no incluido
      });
    });

    it('debe rechazar email duplicado al actualizar', async () => {
      // Arrange
      const profileValues = {
        nombre: 'John',
        email: 'existing@example.com',
      };

      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('Email ya en uso', 409)
      );

      // Act & Assert
      await expect(updateProfile(profileValues)).rejects.toThrow(AuthApiError);
    });
  });

  describe('changePassword', () => {
    it('debe cambiar contraseña correctamente', async () => {
      // Arrange
      const passwordValues = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      (axiosInstance.patch as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      // Act
      await changePassword(passwordValues);

      // Assert
      expect(axiosInstance.patch).toHaveBeenCalledWith('/users/me/password', {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      });
    });

    it('debe rechazar contraseña actual incorrecta', async () => {
      // Arrange
      const passwordValues = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('Contraseña actual incorrecta', 400)
      );

      // Act & Assert
      await expect(changePassword(passwordValues)).rejects.toThrow(
        AuthApiError
      );
    });

    it('debe rechazar nueva contraseña débil', async () => {
      // Arrange
      const passwordValues = {
        currentPassword: 'OldPassword123!',
        newPassword: '123', // muy débil
        confirmPassword: '123',
      };

      (axiosInstance.patch as jest.Mock).mockRejectedValue(
        createMockAxiosError('Contraseña muy débil', 400)
      );

      // Act & Assert
      await expect(changePassword(passwordValues)).rejects.toThrow(
        AuthApiError
      );
    });
  });

  describe('AuthApiError', () => {
    it('debe crear error con mensaje personalizado', () => {
      // Act
      const error = new AuthApiError('Custom error');

      // Assert
      expect(error.name).toBe('AuthApiError');
      expect(error.message).toBe('Custom error');
    });
  });
});
