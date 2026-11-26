/**
 * Servicio de passkeys (CU-MFA fase 2)
 * Registro: options (step-up) → startRegistration → registerVerify.
 * Login: loginOptions → startAuthentication → provider 'passkey' de NextAuth
 * (el verify del login NO va por axios: no puede crear sesión de NextAuth).
 */

import { isAxiosError } from 'axios'
import { axiosInstance } from '@/lib/api/axios-instance'
import {
  MfaApiError,
  buildMfaError,
} from '@/features/auth/services/mfa-service'
import type {
  PasskeyItem,
  PasskeyRegisterOptionsResponse,
  PasskeyLoginOptionsResponse,
} from '@/features/auth/types'

export type { MfaApiError }

/** POST /auth/passkeys/register-options — step-up con contraseña */
export async function passkeyRegisterOptions(
  password: string,
): Promise<PasskeyRegisterOptionsResponse> {
  try {
    const { data } = await axiosInstance.post(
      '/auth/passkeys/register-options',
      { password },
    )
    return data.data as PasskeyRegisterOptionsResponse
  } catch (error) {
    throw buildMfaError(error, 'No se pudo iniciar el registro de la passkey.')
  }
}

/** POST /auth/passkeys/register-verify — step-up + challengeId + credential */
export async function passkeyRegisterVerify(params: {
  password: string
  challengeId: string
  credential: unknown
}): Promise<{ passkeyId: string; nombre: string }> {
  try {
    const { data } = await axiosInstance.post(
      '/auth/passkeys/register-verify',
      params,
    )
    return data.data as { passkeyId: string; nombre: string }
  } catch (error) {
    throw buildMfaError(error, 'No se pudo verificar la nueva passkey.')
  }
}

/** GET /auth/passkeys */
export async function listPasskeys(): Promise<PasskeyItem[]> {
  try {
    const { data } = await axiosInstance.get('/auth/passkeys')
    return (data.data as { passkeys: PasskeyItem[] }).passkeys
  } catch (error) {
    throw buildMfaError(error, 'No se pudieron cargar las passkeys.')
  }
}

/** PATCH /auth/passkeys/:id */
export async function renamePasskey(
  id: string,
  nombre: string,
): Promise<PasskeyItem> {
  try {
    const { data } = await axiosInstance.patch(`/auth/passkeys/${id}`, {
      nombre,
    })
    return (data.data as { passkey: PasskeyItem }).passkey
  } catch (error) {
    throw buildMfaError(error, 'No se pudo renombrar la passkey.')
  }
}

/** DELETE /auth/passkeys/:id — step-up obligatorio */
export async function deletePasskey(
  id: string,
  password: string,
): Promise<{ deleted: true }> {
  try {
    const { data } = await axiosInstance.delete(`/auth/passkeys/${id}`, {
      data: { password },
    })
    return data.data as { deleted: true }
  } catch (error) {
    throw buildMfaError(error, 'No se pudo eliminar la passkey.')
  }
}

/** POST /auth/passkeys/login-options — público (challenge usernameless) */
export async function passkeyLoginOptions(): Promise<PasskeyLoginOptionsResponse> {
  try {
    const { data } = await axiosInstance.post('/auth/passkeys/login-options')
    return data.data as PasskeyLoginOptionsResponse
  } catch (error) {
    throw buildMfaError(error, 'No se pudo iniciar el acceso con passkey.')
  }
}

/** POST /auth/passkeys/login-verify — SOLO para el provider passkey de NextAuth */
export async function passkeyLoginVerify(params: {
  challengeId: string
  credential: unknown
}): Promise<{ token: string; user: unknown }> {
  try {
    const { data } = await axiosInstance.post(
      '/auth/passkeys/login-verify',
      params,
    )
    const payload = data.data as {
      user: unknown
      tokens: { accessToken: string }
    }
    return { token: payload.tokens.accessToken, user: payload.user }
  } catch (error) {
    throw buildMfaError(error, 'No se pudo verificar la passkey.')
  }
}

/** Soporte WebAuthn del navegador (para deshabilitar el botón con tooltip) */
export function browserSupportsWebAuthn(): boolean {
  return (
    typeof window !== 'undefined' && window.PublicKeyCredential !== undefined
  )
}
