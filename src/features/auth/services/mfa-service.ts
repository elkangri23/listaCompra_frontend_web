import { isAxiosError } from 'axios'
import { axiosInstance } from '@/lib/api/axios-instance'
import type {
  MfaStatus,
  TotpSetupResponse,
  TotpVerifyEnableResponse,
} from '@/features/auth/types'

export class MfaApiError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'MfaApiError'
  }
}

function buildMfaError(error: unknown, fallbackMessage: string): MfaApiError {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | {
          error?: { code?: string; message?: string } | string
          message?: string
        }
      | undefined
    // El sobre de error del backend anida { error: { code, message } } (errorMiddleware)
    // mientras que los limiters emiten plano { error: 'RATE_LIMIT_EXCEEDED', message }
    if (typeof data?.error === 'object' && data.error !== null) {
      return new MfaApiError(
        data.error.message ?? fallbackMessage,
        data.error.code,
      )
    }
    if (typeof data?.error === 'string') {
      return new MfaApiError(data.message ?? fallbackMessage, data.error)
    }
    return new MfaApiError(data?.message ?? fallbackMessage)
  }
  if (error instanceof Error) {
    return new MfaApiError(error.message || fallbackMessage)
  }
  return new MfaApiError(fallbackMessage)
}

/** GET /auth/mfa/status — estado MFA del usuario (pinta Seguridad) */
export async function getMfaStatus(): Promise<MfaStatus> {
  try {
    const { data } = await axiosInstance.get('/auth/mfa/status')
    return data.data as MfaStatus
  } catch (error) {
    throw buildMfaError(error, 'No se pudo obtener el estado de seguridad.')
  }
}

/** POST /auth/totp/setup — step-up: contraseña. Devuelve QR + otpauthUrl */
export async function totpSetup(password: string): Promise<TotpSetupResponse> {
  try {
    const { data } = await axiosInstance.post('/auth/totp/setup', { password })
    return data.data as TotpSetupResponse
  } catch (error) {
    throw buildMfaError(error, 'No se pudo iniciar la configuración del TOTP.')
  }
}

/** POST /auth/totp/verify-enable — activa y devuelve los backup codes (UNA sola vez) */
export async function totpVerifyEnable(
  password: string,
  code: string,
): Promise<TotpVerifyEnableResponse> {
  try {
    const { data } = await axiosInstance.post('/auth/totp/verify-enable', {
      password,
      code,
    })
    return data.data as TotpVerifyEnableResponse
  } catch (error) {
    throw buildMfaError(error, 'El código no es válido.')
  }
}

/** POST /auth/totp/disable — step-up: contraseña + código vigente (TOTP o backup) */
export async function totpDisable(
  password: string,
  code?: string,
): Promise<void> {
  try {
    await axiosInstance.post('/auth/totp/disable', {
      password,
      ...(code ? { code } : {}),
    })
  } catch (error) {
    throw buildMfaError(error, 'No se pudo desactivar el TOTP.')
  }
}

/** POST /auth/login/mfa — paso 2 del login. Devuelve el par de tokens */
export async function mfaLogin(
  challengeId: string,
  credentials: { code?: string; backupCode?: string },
): Promise<{ token: string; user: unknown }> {
  try {
    const { data } = await axiosInstance.post('/auth/login/mfa', {
      challengeId,
      ...(credentials.code ? { code: credentials.code } : {}),
      ...(credentials.backupCode ? { backupCode: credentials.backupCode } : {}),
    })
    const payload = data.data as {
      user: unknown
      tokens: { accessToken: string }
    }
    return { token: payload.tokens.accessToken, user: payload.user }
  } catch (error) {
    throw buildMfaError(error, 'El código no es válido.')
  }
}
