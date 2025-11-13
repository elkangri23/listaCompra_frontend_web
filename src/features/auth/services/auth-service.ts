import { isAxiosError } from 'axios'
import { axiosInstance } from '@/lib/api/axios-instance'
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  RefreshTokenRequest,
  AuthUser,
} from '@/features/auth/types'
import type { ProfileFormValues } from '@/features/auth/validators/profile-schema'
import type { ChangePasswordFormValues } from '@/features/auth/validators/password-schema'

// Simplified Auth Error
export class AuthApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthApiError'
  }
}

function buildAuthApiError(error: unknown, fallbackMessage: string): AuthApiError {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    const message = data?.message ?? data?.error ?? error.message ?? fallbackMessage
    return new AuthApiError(message || fallbackMessage)
  }
  if (error instanceof Error) {
    return new AuthApiError(error.message || fallbackMessage)
  }
  return new AuthApiError(fallbackMessage)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Performs user login and returns the authentication token.
 */
export async function login(request: LoginRequest): Promise<{ token: string }> {
  try {
    const payload = {
      email: normalizeEmail(request.email),
      password: request.password,
    }
    const { data } = await axiosInstance.post<{ token: string }>('/auth/login', payload)
    if (typeof data.token !== 'string') {
      throw new Error('La respuesta de la API no contiene un token válido.')
    }
    return data
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo iniciar sesión. Verifica tus credenciales.')
  }
}

/**
 * Refreshes the authentication token.
 * NOTE: The API is contradictory. /auth/login returns a 'token', but /auth/refresh-token
 * expects a 'refreshToken'. We are assuming the token from login should be used here.
 */
export async function refreshToken(request: RefreshTokenRequest): Promise<{ token: string }> {
  if (!request.refreshToken) {
    throw new AuthApiError('No se encontró el token para renovar la sesión.')
  }

  try {
    const { data } = await axiosInstance.post<{ token: string }>('/auth/refresh-token', {
      refreshToken: request.refreshToken,
    })
    if (typeof data.token !== 'string') {
      throw new Error('La respuesta de la API no contiene un token de refresco válido.')
    }
    return data
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo renovar la sesión. Inicia sesión nuevamente.')
  }
}

// --- Other functions remain mostly unchanged ---

export async function registerUser(request: RegisterRequest): Promise<void> {
  try {
    const payload = {
      nombre: request.nombre.trim(),
      apellidos: request.apellidos.trim(),
      email: normalizeEmail(request.email),
      password: request.password,
    }
    await axiosInstance.post('/auth/register', payload)
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo completar el registro. Inténtalo nuevamente.')
  }
}

export async function requestPasswordReset(request: ForgotPasswordRequest): Promise<void> {
  try {
    const payload = {
      email: normalizeEmail(request.email),
    }
    await axiosInstance.post('/auth/forgot-password', payload)
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo enviar el enlace de recuperación.')
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const { data } = await axiosInstance.get('/users/me')
    return data as AuthUser // Assuming the API returns the user structure directly
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo obtener la información del usuario.')
  }
}

export async function updateProfile(values: ProfileFormValues): Promise<AuthUser> {
  try {
    const payload = {
      name: values.nombre.trim(),
      email: normalizeEmail(values.email),
      ...(values.bio && { bio: values.bio.trim() }),
    }
    const { data } = await axiosInstance.patch('/users/me', payload)
    return data as AuthUser
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo actualizar el perfil. Inténtalo nuevamente.')
  }
}

export async function changePassword(values: ChangePasswordFormValues): Promise<void> {
  try {
    const payload = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    }
    await axiosInstance.patch('/users/me/password', payload)
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.')
  }
}