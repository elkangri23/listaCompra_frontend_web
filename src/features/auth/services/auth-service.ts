import { isAxiosError } from 'axios'
import { z } from 'zod'

import { apiClient } from '@/lib/api/axios-instance'
import type {
  AuthResponse,
  AuthTokens,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
} from '@/features/auth/types'

export class AuthApiError extends Error {
  statusCode?: number
  details?: unknown

  constructor(message: string, options?: { statusCode?: number; details?: unknown }) {
    super(message)
    this.name = 'AuthApiError'
    this.statusCode = options?.statusCode
    this.details = options?.details
  }
}

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()).default([]),
  image: z.string().url().nullish(),
})

const authResponseSchema = z
  .object({
    user: userSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int().positive().optional(),
    expiresAt: z.number().int().positive().optional(),
  })
  .refine((data) => Boolean(data.expiresIn) || Boolean(data.expiresAt), {
    message: 'La respuesta de autenticación debe incluir expiresIn o expiresAt.',
  })

const refreshResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresIn: z.number().int().positive().optional(),
    expiresAt: z.number().int().positive().optional(),
  })
  .refine((data) => Boolean(data.expiresIn) || Boolean(data.expiresAt), {
    message: 'La respuesta de refresh debe incluir expiresIn o expiresAt.',
  })

const messageResponseSchema = z.object({
  message: z.string().optional(),
})

function mapExpiresAt(input: { expiresIn?: number; expiresAt?: number }): number {
  if (typeof input.expiresAt === 'number') {
    const isSeconds = input.expiresAt < 10_000_000_000
    return isSeconds ? input.expiresAt * 1000 : input.expiresAt
  }

  const expiresInMs = (input.expiresIn ?? 3600) * 1000
  return Date.now() + expiresInMs
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function buildAuthApiError(error: unknown, fallbackMessage: string): AuthApiError {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status
    const data = error.response?.data as { message?: string; error?: string } | undefined
    const message = data?.message ?? data?.error ?? error.message ?? fallbackMessage
    return new AuthApiError(message || fallbackMessage, { statusCode, details: data })
  }

  if (error instanceof Error) {
    return new AuthApiError(error.message || fallbackMessage)
  }

  return new AuthApiError(fallbackMessage)
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  try {
    const payload = {
      email: normalizeEmail(request.email),
      password: request.password,
    }

    const { data } = await apiClient.post('/auth/login', payload)
    const parsed = authResponseSchema.parse(data)

    return {
      user: {
        id: parsed.user.id,
        email: parsed.user.email,
        name: parsed.user.name,
        roles: parsed.user.roles,
        image: parsed.user.image ?? null,
      },
      tokens: {
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
        expiresAt: mapExpiresAt(parsed),
      },
    }
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo iniciar sesión. Verifica tus credenciales.')
  }
}

export async function registerUser(request: RegisterRequest): Promise<void> {
  try {
    const payload = {
      name: request.name.trim(),
      email: normalizeEmail(request.email),
      password: request.password,
    }

    const response = await apiClient.post('/auth/register', payload)
    messageResponseSchema.parse(response.data ?? {})
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo completar el registro. Inténtalo nuevamente.')
  }
}

export async function requestPasswordReset(request: ForgotPasswordRequest): Promise<void> {
  try {
    const payload = {
      email: normalizeEmail(request.email),
    }

    const response = await apiClient.post('/auth/forgot-password', payload)
    messageResponseSchema.parse(response.data ?? {})
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo enviar el enlace de recuperación.')
  }
}

export async function refreshAccessToken(request: RefreshTokenRequest): Promise<AuthTokens> {
  if (!request.refreshToken) {
    throw new AuthApiError('No se encontró el token de actualización para renovar la sesión.')
  }

  try {
    const { data } = await apiClient.post('/auth/refresh-token', {
      refreshToken: request.refreshToken,
    })

    const parsed = refreshResponseSchema.parse(data)

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken ?? request.refreshToken,
      expiresAt: mapExpiresAt(parsed),
    }
  } catch (error) {
    throw buildAuthApiError(error, 'No se pudo renovar la sesión. Inicia sesión nuevamente.')
  }
}
